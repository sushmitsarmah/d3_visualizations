from pyramid.view import view_config


@view_config(route_name='index', renderer='templates/mytemplate.pt')
def my_view(request):
    return {'project': 'd3_visualizations'}
