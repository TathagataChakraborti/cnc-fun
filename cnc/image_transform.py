import json

from datetime import date, datetime
from pathlib import Path
from typing import List, Optional

import cv2

from cnc.models.migration import (
    MigrationData,
    MigrationManifest,
    MigrationMetadata,
    Story,
)


def get_description(
    date_object: date, manifests: List[MigrationManifest]
) -> Optional[str]:
    manifest = next(filter(lambda x: x.date == date_object, manifests), None)

    return manifest.description if manifest else None


def process_images(
    path_to_images: str, path_to_manifest: str, path_to_model: Optional[str] = None
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

        image = cv2.imread(item)
        new_story = Story(
            date=date_object,
            snapshot=image,
            description=get_description(date_object, metadata.manifests),
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
        path_to_images="../data/migration",
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
