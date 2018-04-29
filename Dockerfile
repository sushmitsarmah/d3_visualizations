FROM python:3.7-rc-alpine3.7

WORKDIR /app

COPY . /app

EXPOSE 6543

RUN pip install -e .

ENTRYPOINT [ "pserve" ]

CMD [ "development.ini" ]
