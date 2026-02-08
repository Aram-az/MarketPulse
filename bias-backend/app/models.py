from sqlalchemy import Column, Integer, String, Float, DateTime
from .database import Base

class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    side = Column(String) # Buy/Sell
    quantity = Column(Float)
    entry_price = Column(Float)
    exit_price = Column(Float)
    pl = Column(Float)
    entry_date = Column(DateTime) # For sorting
    source_file = Column(String) # To track batches