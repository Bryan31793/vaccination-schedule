# ══════════════════════════════════════════════
#  MAIN - EJECUTAR
# ══════════════════════════════════════════════
import numpy as np
from graph_simulation.config import Colors
from graph_simulation.simulation import run_simulation, params
from graph_simulation.animation.setup import create_figure, setup_world_panel, setup_sir_panel, add_title
from graph_simulation.animation.render import create_update_function, export_animation

colors = Colors()

if __name__ == "__main__":
    # Ejecutar simulación
    hist_pos, hist_estado, hist_aristas, hist_sirvd, n_frames = run_simulation(params)
    
    # Estadísticas
    I_vals = [x[1] for x in hist_sirvd]
    peak = int(np.argmax(I_vals))
    print(f"  Simulación: {n_frames} pasos  |  Pico: {max(I_vals)} infectados en t={peak}")
    
    # Crear figura
    fig, components = create_figure(params, colors)
    world_comp = setup_world_panel(components['ax_world'], params, colors)
    sir_comp = setup_sir_panel(components['ax_sir'], params, colors, hist_sirvd)
    add_title(fig, params)
    
    # Crear función de actualización
    update_func = create_update_function(
        hist_pos, hist_estado, hist_aristas, hist_sirvd,
        world_comp, sir_comp, colors
    )
    
    # Exportar animación
    export_animation(fig, update_func, n_frames, params, colors, output_path="outputs/sir_dinamico.mp4")