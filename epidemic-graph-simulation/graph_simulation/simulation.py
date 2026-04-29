from .config import SimulationParams
from typing import Tuple, List
from .initialization import *

def run_simulation(p: SimulationParams) -> Tuple[List, List, List, List, List]:
    """
    Ejecuta la simulacion completa.
    
    Returns:
        (hist_pos, hist_estado, hist_aristas, hist_sir, n_frames)
    """
    pos, vel, estado, timer_inf = initialize_agents(p)
    
    hist_pos = []
    hist_estado = []
    hist_aristas = []
    hist_sir = []
    
    print("⏳  Calculando simulación…")
    for paso in range(p.total_steps):
        # Guardar estado antes de actualizar
        aristas = find_contacts(pos, p.contact_radius)
        hist_pos.append(pos.copy())
        hist_estado.append(estado.copy())
        hist_aristas.append(aristas)
        s, i, r = get_sir_counts(estado)
        hist_sir.append((s, i, r))
        
        # Si no hay infectados y pasaron suficientes pasos, terminar
        if i == 0 and paso > 10:
            for _ in range(p.total_steps - paso - 1):
                hist_pos.append(pos.copy())
                hist_estado.append(estado.copy())
                hist_sir.append((s, 0, r))
                hist_aristas.append(aristas)
            break
        
        # Actualizar dinámicas
        estado, timer_inf = apply_transmission(estado, timer_inf, aristas, p.transmission_rate)
        estado, timer_inf = apply_recovery(estado, timer_inf, p.infection_duration)
        pos, vel = apply_movement(pos, vel, p.width, p.height)
    
    return hist_pos, hist_estado, hist_aristas, hist_sir, len(hist_pos)