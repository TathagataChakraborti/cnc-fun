from datetime import datetime
from typing import List, Optional

from PIL import Image
from pydantic import BaseModel


class Story(BaseModel):
    datetime: datetime
    description: Optional[str] = None
    snapshot: Image.Image

    def crop(self) -> Image.Image:
        raise NotImplementedError()


class Migration(BaseModel):
    storyboard: List[Story]
