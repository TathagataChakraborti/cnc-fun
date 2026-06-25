from pydantic import BaseModel

from cnc.models.forgotten import FORGOTTEN


class DailyDistribution(BaseModel):
    datetime: str
    type: FORGOTTEN
