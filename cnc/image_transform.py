from datetime import datetime
from pathlib import Path

import cv2

from cnc.models.migration import Migration, Story


def process_images(path_to_images: str | Path) -> Migration:
    migration_object = Migration()
    path = path_to_images if isinstance(path_to_images, Path) else Path(path_to_images)

    for item in list(path.glob("*.png")):
        print(f"Processing {item} ...")

        name_split = str(item).split()
        date_string = name_split[1]
        date_object = datetime.strptime(date_string, "%Y-%m-%d").date()

        image = cv2.imread(item)
        new_story = Story(
            date=date_object,
            snapshot=image,
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
    migration = process_images("../data/migration")

    for story in migration.storyboard:
        cv2.imwrite(
            filename=f"../public/images/migration/{story.date}.png", img=story.transform
        )
