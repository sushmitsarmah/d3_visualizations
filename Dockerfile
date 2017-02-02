FROM ubuntu:16.04

RUN apt-get update -y && \
	apt-get install -y python-pip python-dev curl && \
	pip install --upgrade pip setuptools

WORKDIR /app

COPY . /app

EXPOSE 6543

RUN pip install -e .

ENTRYPOINT [ "pserve" ]

CMD [ "development.ini" ]