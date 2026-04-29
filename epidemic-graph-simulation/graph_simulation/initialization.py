from .config import SimulationParams, STATE_INFECTED, STATE_SUSCEPTIBLE, STATE_RECOVERED
import numpy as np
from typing import Tuple, List
from scipy.spatial import cKDTree

#_______________
# Estos parametros se deben refactorizar
#_______________
# Parametros por defecto
params = SimulationParams()
rng = np.random.default_rng(params.seed)

def initialize_agents(p: SimulationParams) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Inicializa posiciones, velocidades, estados y timers de agentes.
    
    Returns:
        (positions, velocities, states, infection_timers)
    """
    # Posiciones aleatorias
    pos = rng.uniform([0, 0], [p.width, p.height], size=(p.n_agents, 2))
    
    # Velocidades con módulo fijo
    angles = rng.uniform(0, 2*np.pi, p.n_agents)
    vel = p.velocity * np.column_stack([np.cos(angles), np.sin(angles)])
    
    # Estados iniciales
    estado = np.zeros(p.n_agents, dtype=int)
    infectados_init = rng.choice(p.n_agents, p.initial_infected, replace=False)
    estado[infectados_init] = STATE_INFECTED
    
    # Timers de infección
    timer_inf = np.zeros(p.n_agents, dtype=int)
    timer_inf[infectados_init] = 1
    
    return pos, vel, estado, timer_inf


def find_contacts(pos: np.ndarray, radius: float) -> List[Tuple[int, int]]:
    """Encuentra pares de agentes dentro del radio de contacto usando KDTree."""
    tree = cKDTree(pos)
    return list(tree.query_pairs(radius))


def apply_transmission(
    estado: np.ndarray,
    timer_inf: np.ndarray,
    aristas: List[Tuple[int, int]],
    beta: float
) -> Tuple[np.ndarray, np.ndarray]:
    """Aplica transmisión de infección a través de contactos."""
    nuevo_estado = estado.copy()
    nuevo_timer = timer_inf.copy()
    
    for idx1, idx2 in aristas:
        for src, dst in [(idx1, idx2), (idx2, idx1)]:
            if estado[src] == STATE_INFECTED and nuevo_estado[dst] == STATE_SUSCEPTIBLE:
                if rng.random() < beta:
                    nuevo_estado[dst] = STATE_INFECTED
                    nuevo_timer[dst] = 1
    
    return nuevo_estado, nuevo_timer


def apply_recovery(
    estado: np.ndarray,
    timer_inf: np.ndarray,
    infection_duration: int
) -> Tuple[np.ndarray, np.ndarray]:
    """Marca como recuperados a los infectados que completaron la duración."""
    nuevo_estado = estado.copy()
    nuevo_timer = timer_inf.copy()
    
    inf_mask = (estado == STATE_INFECTED)
    nuevo_timer[inf_mask] += 1
    recuperados = inf_mask & (nuevo_timer >= infection_duration)
    nuevo_estado[recuperados] = STATE_RECOVERED
    nuevo_timer[recuperados] = 0
    
    return nuevo_estado, nuevo_timer


def apply_movement(
    pos: np.ndarray,
    vel: np.ndarray,
    width: int,
    height: int
) -> Tuple[np.ndarray, np.ndarray]:
    """Actualiza posiciones con rebote en bordes."""
    pos = pos + vel
    
    # Rebote en eje X
    mask_lo = pos[:, 0] < 0
    mask_hi = pos[:, 0] > width
    pos[mask_lo, 0] = -pos[mask_lo, 0]
    pos[mask_hi, 0] = 2*width - pos[mask_hi, 0]
    vel[mask_lo | mask_hi, 0] *= -1
    
    # Rebote en eje Y
    mask_lo = pos[:, 1] < 0
    mask_hi = pos[:, 1] > height
    pos[mask_lo, 1] = -pos[mask_lo, 1]
    pos[mask_hi, 1] = 2*height - pos[mask_hi, 1]
    vel[mask_lo | mask_hi, 1] *= -1
    
    return pos, vel


def get_sir_counts(estado: np.ndarray) -> Tuple[int, int, int]:
    """Retorna (susceptibles, infectados, recuperados)."""
    s = int(np.sum(estado == STATE_SUSCEPTIBLE))
    i = int(np.sum(estado == STATE_INFECTED))
    r = int(np.sum(estado == STATE_RECOVERED))
    return s, i, r
