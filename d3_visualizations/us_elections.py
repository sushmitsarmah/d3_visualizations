from pyramid.view import view_config

@view_config(route_name='us_elections', renderer='templates/uselections.pt')
def my_view(request):
    return {'project': 'd3_visualizations'}