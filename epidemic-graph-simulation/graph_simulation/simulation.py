from .config import SimulationParams, STATE_VACCINATED
from typing import Tuple, List
from .initialization import *

def run_simulation(p: SimulationParams) -> Tuple[List, List, List, List, List]:
    """
    Ejecuta la simulacion completa (modelo SIRVD).
    
    Returns:
        (hist_pos, hist_estado, hist_aristas, hist_sirvd, n_frames)
    """
    pos, vel, estado, timer_inf = initialize_agents(p)
    
    # Aplicar vacunación inicial
    estado, timer_inf = apply_vaccinated(estado, timer_inf, p.initial_vaccinated / p.n_agents)
    
    hist_pos = []
    hist_estado = []
    hist_aristas = []
    hist_sirvd = []
    
    print("  Calculando simulación…")
    for paso in range(p.total_steps):
        # Guardar estado antes de actualizar
        aristas = find_contacts(pos, p.contact_radius)
        hist_pos.append(pos.copy())
        hist_estado.append(estado.copy())
        hist_aristas.append(aristas)
        s, i, r, v, d = get_sirvd_counts(estado)
        hist_sirvd.append((s, i, r, v, d))
        
        # Si no hay infectados y pasaron suficientes pasos, terminar
        if i == 0 and paso > 10:
            for _ in range(p.total_steps - paso - 1):
                hist_pos.append(pos.copy())
                hist_estado.append(estado.copy())
                hist_sirvd.append((s, 0, r, v, d))
                hist_aristas.append(aristas)
            break
        
        # Actualizar dinámicas
        estado, timer_inf = apply_transmission(estado, timer_inf, aristas, p.transmission_rate)
        estado, timer_inf = apply_recovery(estado, timer_inf, p.infection_duration)
        estado, timer_inf = apply_deaths(estado, timer_inf, p.mortality_rate)
        estado, timer_inf = apply_vaccinated(estado, timer_inf, p.vaccination_rate / p.total_steps)  # Vacunación gradual
        pos, vel = apply_movement(pos, vel, p.width, p.height)
    
    return hist_pos, hist_estado, hist_aristas, hist_sirvd, len(hist_pos)