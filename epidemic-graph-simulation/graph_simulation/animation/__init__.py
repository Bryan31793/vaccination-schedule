"""
Paquete animation - Visualización y renderizado de simulaciones
"""

from .setup import create_figure, setup_world_panel, setup_sir_panel, add_title
from .render import create_update_function, export_animation

__all__ = [
    'create_figure',
    'setup_world_panel',
    'setup_sir_panel',
    'add_title',
    'create_update_function',
    'export_animation',
]
