import json

from datetime import date, datetime
from pathlib import Path

import cv2

from cnc.models.migration import (
    EventType,
    MigrationData,
    MigrationManifest,
    MigrationMetadata,
    Story,
)


def get_manifest(
    date_object: date, manifests: list[MigrationManifest]
) -> MigrationManifest | None:
    return next(filter(lambda x: x.date == date_object, manifests), None)


def get_description(date_object: date, manifests: list[MigrationManifest]) -> list[str]:
    manifest = get_manifest(date_object, manifests)

    return manifest.description if manifest else []


def is_grayscale(date_object: date, manifests: list[MigrationManifest]) -> bool:
    manifest = get_manifest(date_object, manifests)

    return manifest.type == EventType.NONE if manifest else False


def process_images(
    path_to_images: str, path_to_manifest: str, path_to_model: str | None = None
) -> MigrationData:
    metadata = MigrationMetadata()

    with open(path_to_manifest) as manifest_file:
        raw_manifest = json.load(manifest_file)

        for item in raw_manifest:
            manifest_object = MigrationManifest.model_validate(item)
            metadata.manifests.append(manifest_object)

    migration_object = MigrationData(metadata=metadata)

    for item in list(Path(path_to_images).glob("*.png")):
        print(f"Processing {item} ...")

        name_split = str(item).split()
        date_string = name_split[1]
        date_object = datetime.strptime(date_string, "%Y-%m-%d").date()

        if metadata.start_date is None or metadata.start_date > date_object:
            metadata.start_date = date_object

        if metadata.end_date is None or metadata.end_date < date_object:
            metadata.end_date = date_object

        description = get_description(date_object, metadata.manifests)
        none_check = is_grayscale(date_object, metadata.manifests)

        image = cv2.imread(
            item, cv2.IMREAD_GRAYSCALE if none_check else cv2.IMREAD_COLOR
        )

        new_story = Story(
            date=date_object,
            snapshot=image,
            description=description,
        )

        new_story.make_transform(
            start_y=395,
            end_y=2025,
            start_x=530,
            end_x=2930,
            path_to_model=path_to_model,
        )

        migration_object.storyboard.append(new_story)

    return migration_object


if __name__ == "__main__":
    migration_data = process_images(
        path_to_images="../data/migration-72",
        path_to_manifest="../data/migration_manifest.json",
        # path_to_model="../data/FSRCNN_x4.pb"
    )

    for story in migration_data.storyboard:
        cv2.imwrite(
            filename=f"../public/images/migration/{story.date}.png", img=story.transform
        )

    with open("../src/cache/migration_manifest.json", "w") as metadata_file:
        json.dump(
            migration_data.metadata.model_dump(),
            metadata_file,
            indent=4,
            default=str,
        )
