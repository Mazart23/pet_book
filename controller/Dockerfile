FROM python:3.12-slim

WORKDIR /redirecter

RUN apt-get update && \
    apt-get install -y gcc default-libmysqlclient-dev && \
    apt-get -q -y install --no-install-recommends \
    build-essential \
    python3-dev \
    pkg-config

RUN python -m pip install --upgrade pip

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

EXPOSE 5001

COPY . .

CMD ["python3", "app.py"]