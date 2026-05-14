from typing import List
from ..config import Colors, SimulationParams, STATE_SUSCEPTIBLE, STATE_INFECTED, STATE_RECOVERED, STATE_VACCINATED, STATE_DEAD
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation, FFMpegWriter

def create_update_function(
    hist_pos: List,
    hist_estado: List,
    hist_aristas: List,
    hist_sirvd: List,
    world_components: dict,
    sir_components: dict,
    c: Colors
):
    """Crea la función de actualización para cada frame (modelo SIRVD)."""
    
    def update(frame):
        p = hist_pos[frame]
        e = hist_estado[frame]
        aristas = hist_aristas[frame]
        
        # Colores por estado
        colores = np.where(
            e == STATE_SUSCEPTIBLE,
            c.susceptible,
            np.where(e == STATE_INFECTED, c.infected,
                np.where(e == STATE_RECOVERED, c.recovered,
                    np.where(e == STATE_VACCINATED, c.vaccinated, c.dead)
                )
            )
        )
        
        # Actualizar scatter de agentes
        world_components['scatter'].set_offsets(p)
        world_components['scatter'].set_color(colores)
        
        # Halo sobre infectados
        inf_mask = (e == STATE_INFECTED)
        if inf_mask.any():
            world_components['halo'].set_offsets(p[inf_mask])
            world_components['halo'].set_visible(True)
        else:
            world_components['halo'].set_visible(False)
        
        # Aristas dinámicas
        if aristas:
            segmentos_x, segmentos_y = [], []
            for (i, j) in aristas:
                segmentos_x += [p[i, 0], p[j, 0], None]
                segmentos_y += [p[i, 1], p[j, 1], None]
            world_components['edge_lines'].set_data(segmentos_x, segmentos_y)
        else:
            world_components['edge_lines'].set_data([], [])
        
        # Actualizar curvas SIRVD
        s, i, r, v, d = hist_sirvd[frame]
        sir_c = sir_components
        
        sir_c['line_s'].set_data(sir_c['taxis'][:frame+1], sir_c['S_vals'][:frame+1])
        sir_c['line_i'].set_data(sir_c['taxis'][:frame+1], sir_c['I_vals'][:frame+1])
        sir_c['line_r'].set_data(sir_c['taxis'][:frame+1], sir_c['R_vals'][:frame+1])
        sir_c['line_v'].set_data(sir_c['taxis'][:frame+1], sir_c['V_vals'][:frame+1])
        sir_c['line_d'].set_data(sir_c['taxis'][:frame+1], sir_c['D_vals'][:frame+1])
        sir_c['dot_s'].set_data([frame], [s])
        sir_c['dot_i'].set_data([frame], [i])
        sir_c['dot_r'].set_data([frame], [r])
        sir_c['dot_v'].set_data([frame], [v])
        sir_c['dot_d'].set_data([frame], [d])
        
        # Actualizar información
        world_components['info'].set_text(
            f" Paso : {frame:>4}/{len(hist_pos)-1}\n"
            f" S    : {s:>4}  ({100*s/len(p):.1f}%)\n"
            f" I    : {i:>4}  ({100*i/len(p):.1f}%)\n"
            f" R    : {r:>4}  ({100*r/len(p):.1f}%)\n"
            f" V    : {v:>4}  ({100*v/len(p):.1f}%)\n"
            f" D    : {d:>4}  ({100*d/len(p):.1f}%)"
        )
        
        return (
            world_components['scatter'],
            world_components['halo'],
            world_components['edge_lines'],
            sir_c['line_s'],
            sir_c['line_i'],
            sir_c['line_r'],
            sir_c['line_v'],
            sir_c['line_d'],
            sir_c['dot_s'],
            sir_c['dot_i'],
            sir_c['dot_r'],
            sir_c['dot_v'],
            sir_c['dot_d'],
            world_components['info']
        )
    
    return update


def export_animation(
    fig: plt.Figure,
    update_func,
    n_frames: int,
    p: SimulationParams,
    c: Colors,
    output_path: str = "outputs/sirvd_dinamico.mp4"
) -> None:
    """Crea y guarda la animación en un archivo MP4 (modelo SIRVD)."""
    anim = FuncAnimation(fig, update_func, frames=n_frames, interval=42, blit=True)
    
    print(f"🎬  Renderizando {n_frames} frames a {p.fps} fps…")
    writer = FFMpegWriter(
        fps=p.fps,
        bitrate=3000,
        extra_args=["-pix_fmt", "yuv420p", "-crf", "17"]
    )
    anim.save(output_path, writer=writer, savefig_kwargs={"facecolor": c.background})
    print(f"✅  Video guardado en: {output_path}")
