from ..config import SimulationParams, Colors
from typing import Tuple, List
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import matplotlib.patches as mpatches

def create_figure(p: SimulationParams, c: Colors) -> Tuple[plt.Figure, dict]:
    """
    Crea la figura con dos paneles (mundo y curvas SIR).
    
    Returns:
        (fig, components_dict) donde components_dict contiene todos los artistas
    """
    fig = plt.figure(figsize=(16, 7), facecolor=c.background, dpi=120)
    gs = gridspec.GridSpec(1, 2, width_ratios=[1.6, 1], wspace=0.28,
                           left=0.03, right=0.97, top=0.90, bottom=0.09)
    
    ax_world = fig.add_subplot(gs[0])
    ax_sir = fig.add_subplot(gs[1])
    
    components = {
        'fig': fig,
        'ax_world': ax_world,
        'ax_sir': ax_sir,
    }
    
    return fig, components


def setup_world_panel(
    ax: plt.Axes,
    p: SimulationParams,
    c: Colors
) -> dict:
    """Configura el panel del mundo."""
    ax.set_facecolor(c.background)
    ax.set_xlim(0, p.width)
    ax.set_ylim(0, p.height)
    ax.set_aspect("equal")
    ax.axis("off")
    ax.set_title("Representacion grafica",
                 color="white", fontsize=13, fontweight="bold", pad=10)
    
    # Borde del mundo
    for spine in [
        [0, 0, p.width, 0],
        [p.width, 0, p.width, p.height],
        [p.width, p.height, 0, p.height],
        [0, p.height, 0, 0]
    ]:
        ax.plot([spine[0], spine[2]], [spine[1], spine[3]],
                color=c.grid, lw=1.2)
    
    # Artistas
    edge_lines, = ax.plot([], [], color="#3A3A5E", lw=0.4, alpha=0.55,
                          solid_capstyle="round", zorder=1)
    sc = ax.scatter([], [], s=55, zorder=3, linewidths=0.4, edgecolors=c.background)
    sc_halo = ax.scatter([], [], s=200, zorder=2, c=c.infected, alpha=0.18, linewidths=0)
    
    # Leyenda
    patches = [
        mpatches.Patch(color=c.susceptible, label="Susceptible"),
        mpatches.Patch(color=c.infected, label="Infectado"),
        mpatches.Patch(color=c.recovered, label="Recuperado"),
        mpatches.Patch(color=c.vaccinated, label="Vacunado"),
        mpatches.Patch(color=c.dead, label="Fallecido")
    ]
    ax.legend(handles=patches, loc="lower left",
              facecolor=c.text_bg, edgecolor=c.grid,
              labelcolor="white", fontsize=9, framealpha=0.92)
    
    # Información de texto
    info = ax.text(0.01, 0.99, "", transform=ax.transAxes,
                   color="white", fontsize=9, va="top", family="monospace",
                   bbox=dict(boxstyle="round,pad=0.45", fc=c.text_bg,
                            ec=c.grid, alpha=0.92))
    
    return {
        'ax': ax,
        'edge_lines': edge_lines,
        'scatter': sc,
        'halo': sc_halo,
        'info': info
    }


def setup_sir_panel(
    ax: plt.Axes,
    p: SimulationParams,
    c: Colors,
    sir_vals: List[Tuple[int, int, int, int, int]]
) -> dict:
    """Configura el panel SIRVD."""
    ax.set_facecolor(c.background)
    for spine in ax.spines.values():
        spine.set_edgecolor(c.grid)
    ax.tick_params(colors="#888", labelsize=9)
    ax.set_xlim(0, len(sir_vals) - 1)
    ax.set_ylim(0, p.n_agents)
    ax.set_xlabel("Paso de tiempo", color="#AAAAAA", fontsize=10)
    ax.set_ylabel("Individuos", color="#AAAAAA", fontsize=10)
    ax.set_title("Curvas SIRVD", color="white", fontsize=13,
                 fontweight="bold", pad=10)
    ax.grid(color="#1E2A3A", lw=0.5, alpha=0.6)
    
    # Extraer valores
    S_vals = [x[0] for x in sir_vals]
    I_vals = [x[1] for x in sir_vals]
    R_vals = [x[2] for x in sir_vals]
    V_vals = [x[3] for x in sir_vals]
    D_vals = [x[4] for x in sir_vals]
    taxis = list(range(len(sir_vals)))
    peak = int(np.argmax(I_vals))
    
    # Gráficas de fondo
    ax.fill_between(taxis, S_vals, color=c.susceptible, alpha=0.07)
    ax.fill_between(taxis, I_vals, color=c.infected, alpha=0.07)
    ax.fill_between(taxis, R_vals, color=c.recovered, alpha=0.07)
    ax.fill_between(taxis, V_vals, color=c.vaccinated, alpha=0.07)
    ax.fill_between(taxis, D_vals, color=c.dead, alpha=0.07)
    
    ax.plot(taxis, S_vals, color=c.susceptible, lw=1, alpha=0.2)
    ax.plot(taxis, I_vals, color=c.infected, lw=1, alpha=0.2)
    ax.plot(taxis, R_vals, color=c.recovered, lw=1, alpha=0.2)
    ax.plot(taxis, V_vals, color=c.vaccinated, lw=1, alpha=0.2)
    ax.plot(taxis, D_vals, color=c.dead, lw=1, alpha=0.2)
    
    ax.axvline(peak, color=c.infected, lw=1, ls="--", alpha=0.4)
    ax.text(peak + 0.5, p.n_agents * 0.97, f"Pico t={peak}",
            color=c.infected, fontsize=8, va="top")
    
    # Líneas dinámicas
    line_s, = ax.plot([], [], color=c.susceptible, lw=2.5, label="Susceptibles", zorder=5)
    line_i, = ax.plot([], [], color=c.infected, lw=2.5, label="Infectados", zorder=5)
    line_r, = ax.plot([], [], color=c.recovered, lw=2.5, label="Recuperados", zorder=5)
    line_v, = ax.plot([], [], color=c.vaccinated, lw=2.5, label="Vacunados", zorder=5)
    line_d, = ax.plot([], [], color=c.dead, lw=2.5, label="Fallecidos", zorder=5)
    
    dot_s = ax.plot([], [], "o", color=c.susceptible, ms=6, zorder=6)[0]
    dot_i = ax.plot([], [], "o", color=c.infected, ms=6, zorder=6)[0]
    dot_r = ax.plot([], [], "o", color=c.recovered, ms=6, zorder=6)[0]
    dot_v = ax.plot([], [], "o", color=c.vaccinated, ms=6, zorder=6)[0]
    dot_d = ax.plot([], [], "o", color=c.dead, ms=6, zorder=6)[0]
    
    ax.legend(loc="upper right", facecolor=c.text_bg, edgecolor=c.grid,
              labelcolor="white", fontsize=9, framealpha=0.92)
    
    return {
        'ax': ax,
        'line_s': line_s,
        'line_i': line_i,
        'line_r': line_r,
        'line_v': line_v,
        'line_d': line_d,
        'dot_s': dot_s,
        'dot_i': dot_i,
        'dot_r': dot_r,
        'dot_v': dot_v,
        'dot_d': dot_d,
        'S_vals': S_vals,
        'I_vals': I_vals,
        'R_vals': R_vals,
        'V_vals': V_vals,
        'D_vals': D_vals,
        'taxis': taxis,
        'peak': peak
    }


def add_title(fig: plt.Figure, p: SimulationParams) -> None:
    """Añade título general a la figura."""
    fig.suptitle(
        f"SIRVD · Grafo Dinámico  |  N={p.n_agents}  "
        f"Radio={p.contact_radius}  β={p.transmission_rate}  "
        f"Dur.inf={p.infection_duration} pasos",
        color="white", fontsize=12, y=0.96
    )