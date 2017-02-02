import sqlite3
import json
from pyramid.view import view_config

@view_config(route_name='us_elections_api', renderer='json')
def elections(request):
    table = request.params.getone('table')
    area_name = request.params.getall('area_name')

    print( list(request.params.keys()) )

    query = "SELECT * FROM "+table

    if len(area_name) > 0:

        where = " where area_name in ("
        for i in area_name:
            where += "'"+i + "',"
        where = where[0:-1]+")"
        query += where

    conn = sqlite3.connect('d3_visualizations/static/data/database.sqlite')
    c = conn.cursor()
    c.execute(query)
    data = json.loads(json.dumps(c.fetchall()))
    c.close()
    return data