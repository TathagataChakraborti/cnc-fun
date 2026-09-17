from datetime import date
from enum import StrEnum, auto

import cv2
import numpy as np

from cv2.typing import MatLike
from pydantic import BaseModel, ConfigDict


class EventType(StrEnum):
    ERROR = auto()
    INFO = auto()
    SUCCESS = auto()
    WARNING = auto()
    NONE = auto()


class MigrationManifest(BaseModel):
    date: date
    description: list[str] = []
    type: EventType = EventType.INFO


class MigrationMetadata(BaseModel):
    start_date: date | None = None
    end_date: date | None = None
    manifests: list[MigrationManifest] = []


class Story(BaseModel):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )

    date: date
    description: list[str] = []
    snapshot: MatLike
    transform: MatLike | None = None

    def make_transform(
        self,
        start_y: int,
        end_y: int,
        start_x: int,
        end_x: int,
        path_to_model: str | None = None,
    ) -> MatLike:
        image = self.snapshot[start_y:end_y, start_x:end_x]
        h, w = image.shape[:2]

        src_pts = np.float32([[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]])

        dst_pts = np.float32(
            [
                [w * 0.15, h * 0.50],
                [w * 0.85, h * 0.40],
                [w * 0.05, h * 1.15],
                [w * 1.20, h * 1],
            ]
        )

        perspective_matrix = cv2.getPerspectiveTransform(src_pts, dst_pts)
        output_image = cv2.warpPerspective(
            image,
            perspective_matrix,
            dsize=(int(w * 1.2), int(h * 1.2)),
            flags=cv2.INTER_LANCZOS4,
            borderMode=cv2.BORDER_CONSTANT,
            borderValue=(0, 0, 0),
        )

        output_image = output_image[850:1550, 500:1900]

        if path_to_model:
            sr = cv2.dnn_superres.DnnSuperResImpl_create()

            sr.readModel(path_to_model)
            sr.setModel("fsrcnn", 4)  # Upscale by 2x

            output_image = sr.upsample(output_image)
            output_image = cv2.resize(
                output_image, dsize=(0, 0), fx=4, fy=4, interpolation=cv2.INTER_LANCZOS4
            )

        self.transform = output_image
        return self.transform


class MigrationData(BaseModel):
    storyboard: list[Story] = []
    metadata: MigrationMetadata
