"""
Paquete graph_simulation - Simulación SIR con grafo dinámico
"""

from .config import SimulationParams, Colors, STATE_SUSCEPTIBLE, STATE_INFECTED, STATE_RECOVERED
from .initialization import initialize_agents, find_contacts, apply_transmission, apply_recovery, apply_movement, get_sir_counts, params
from .simulation import run_simulation

__all__ = [
    'SimulationParams',
    'Colors',
    'STATE_SUSCEPTIBLE',
    'STATE_INFECTED',
    'STATE_RECOVERED',
    'initialize_agents',
    'find_contacts',
    'apply_transmission',
    'apply_recovery',
    'apply_movement',
    'get_sir_counts',
    'params',
    'run_simulation',
]
