from pyramid.view import view_config


@view_config(route_name='energy', renderer='templates/energy.pt')
def my_view(request):
    return {'project': 'd3_visualizations'}
