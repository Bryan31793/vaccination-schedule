from dataclasses import dataclass

@dataclass
class SimulationParams:
    """Parametros de la simulacion"""
    n_agents: int = 200
    width: int = 800
    height: int = 500
    velocity: float = 2.5
    contact_radius: float = 28
    transmission_rate: float = 0.35
    infection_duration: int = 80
    initial_infected: int = 5
    total_steps: int = 300
    seed: int = 42
    fps: int = 24

@dataclass
class Colors:
    """Esquema de colores"""
    susceptible: str = "#4FC3F7"      # Azul claro
    infected: str = "#EF5350"         # Rojo
    recovered: str = "#66BB6A"        # Verde
    background: str = "#0D1117"       # Fondo oscuro
    grid: str = "#2A2A3E"            # Gris oscuro
    text_bg: str = "#141824"         # Fondo para texto

# Estados para agentes
STATE_SUSCEPTIBLE = 0
STATE_INFECTED = 1
STATE_RECOVERED = 2
