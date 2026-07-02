import json

from datetime import date, datetime
from pathlib import Path
from typing import List, Optional

import cv2

from cnc.models.migration import Migration, MigrationManifest, Story


def get_description(
    date_object: date, manifests: List[MigrationManifest]
) -> Optional[str]:
    manifest = next(filter(lambda x: x.date == date_object, manifests), None)

    return manifest.description if manifest else None


def process_images(path_to_images: str, path_to_manifest: str) -> Migration:
    migration_object = Migration()

    with open(path_to_manifest) as manifest_file:
        raw_manifest = json.load(manifest_file)
        migration_manifests = [
            MigrationManifest.model_validate(item) for item in raw_manifest
        ]

    for item in list(Path(path_to_images).glob("*.png")):
        print(f"Processing {item} ...")

        name_split = str(item).split()
        date_string = name_split[1]
        date_object = datetime.strptime(date_string, "%Y-%m-%d").date()

        image = cv2.imread(item)
        new_story = Story(
            date=date_object,
            snapshot=image,
            description=get_description(date_object, migration_manifests),
        )

        new_story.make_transform(
            start_y=395,
            end_y=2025,
            start_x=530,
            end_x=2930,
            # path_to_model="../data/FSRCNN_x4.pb"
        )

        migration_object.storyboard.append(new_story)

    return migration_object


if __name__ == "__main__":
    migration = process_images(
        path_to_images="../data/migration",
        path_to_manifest="../data/migration_manifest.json",
    )

    # for story in migration.storyboard:
    #     cv2.imwrite(
    #         filename=f"../public/images/migration/{story.date}.png", img=story.transform
    #     )

    with open("../src/cache/migration_manifest.json", "w") as manifest_file:
        json.dump(
            [
                story.model_dump(include={"date", "description"})
                for story in migration.storyboard
                if story.description
            ],
            manifest_file,
            indent=4,
            default=str,
        )
