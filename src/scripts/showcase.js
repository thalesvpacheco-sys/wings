/* Demonstração interativa da plataforma (seção Produto).
   Simulação local: nenhuma requisição de rede, nenhuma alteração de dados reais.
   Estados (filtros, Kanban, briefing) vivem só na memória desta página. */
import { demo as D } from "../data/showcase-demo.js";
import { escapeHtml as esc } from "./utils/dom.js";

export function initShowcase() {
  var screenEl = document.getElementById("screen");
  if (!D || !screenEl) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var main = document.getElementById("app-main");
  var crumb = document.getElementById("crumb-cur");
  var ctxEl = document.getElementById("sc-context");
  var tabs = Array.prototype.slice.call(document.querySelectorAll('#sc-menu [role="tab"]'));
  var sideBtns = Array.prototype.slice.call(document.querySelectorAll(".app-side [data-screen]"));
  var modal = document.getElementById("rec-modal");

  // estado local (cópias para não alterar o arquivo de dados)
  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }
  var state = {
    current: "visao",
    phaseSel: 1,
    stepSel: 4,
    procDay: null,
    procType: "Todas",
    campFilter: "open",
    openReviews: {},
    view: { estrategia: "list", cronograma: "list", midia: "list" },
    filter: { estrategia: "Todos", cronograma: "Todos", midia: "Todos" },
    records: { estrategia: clone(D.strategy), cronograma: clone(D.schedule), midia: clone(D.media) },
    planner: clone(D.planner),
  };

  // ---------------------------------------------------------------- utilidades
  function brl(n, cents) {
    return (
      "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 })
    );
  }
  function pct(a, b, dec) {
    return (
      (b ? (a / b) * 100 : 0).toLocaleString("pt-BR", {
        minimumFractionDigits: dec || 0,
        maximumFractionDigits: dec || 0,
      }) + "%"
    );
  }
  function chip(status) {
    return '<span class="chip ' + (D.statuses[status] || "nt") + '">' + esc(status) + "</span>";
  }
  function scColor(status) {
    var c = D.statuses[status];
    return c === "ok" ? "var(--ok)" : c === "in" ? "var(--royal)" : c === "wn" ? "var(--warn)" : "var(--haze)";
  }
  function head(title, sub, extra) {
    return (
      '<div class="s-head"><div><div class="ey">Controle de campanha</div><h3>' +
      esc(title) +
      "</h3><p>" +
      esc(sub) +
      "</p></div>" +
      (extra || "") +
      "</div>"
    );
  }
  var ICON = {};
  sideBtns.forEach(function (b) {
    var s = b.querySelector("svg");
    if (s) ICON[b.dataset.screen] = s.outerHTML;
  });

  // ---------------------------------------------------------------- telas
  var screens = {};

  screens.visao = function () {
    var o = D.overview,
      max = Math.max.apply(
        null,
        o.phases.map(function (p) {
          return p.value;
        }),
      );
    var total = o.phases.reduce(function (a, p) {
      return a + p.value;
    }, 0);
    var compTotal = o.composition.reduce(function (a, p) {
      return a + p.value;
    }, 0);
    var sel = o.phases[state.phaseSel];
    var step = o.journey[state.stepSel];
    var h = head("Visão geral", "Seu lançamento, em perspectiva.");
    h +=
      '<div class="card proj-card"><div><span class="lbl">Planejamento do projeto</span><h4>' +
      esc(D.project.name) +
      '</h4><span class="sub">' +
      esc(D.project.owner) +
      "</span></div>" +
      '<div class="side"><span class="lbl">Planejamento integrado</span><b>' +
      D.project.records +
      ' registros</b><span class="sub">Planejamento de mídia e lançamento imobiliário</span></div></div>';
    h +=
      '<div class="grid-k">' +
      o.kpis
        .map(function (k) {
          return (
            '<div class="card kpi"><small>' +
            esc(k.label) +
            "</small><b>" +
            esc(k.value) +
            "</b><em>" +
            esc(k.note) +
            "</em></div>"
          );
        })
        .join("") +
      "</div>";
    h +=
      '<div class="row2"><div class="card"><span class="lbl">Mídia e produção</span><h4>Investimento por fase</h4><span class="sub">Orçamento previsto · ' +
      brl(total) +
      "</span>" +
      '<div class="bars" role="group" aria-label="Investimento previsto por fase">' +
      o.phases
        .map(function (p, i) {
          return (
            '<button type="button" data-phase="' +
            i +
            '" aria-pressed="' +
            (i === state.phaseSel) +
            '" aria-label="' +
            esc(p.name) +
            ": " +
            brl(p.value) +
            '"><span class="val">' +
            (p.value / 1000).toLocaleString("pt-BR") +
            ' mil</span><span class="col" style="--h:' +
            Math.round((p.value / max) * 100) +
            '%"></span></button>'
          );
        })
        .join("") +
      '</div><div class="bars-l">' +
      o.phases
        .map(function (p) {
          return "<span>" + esc(p.name) + "</span>";
        })
        .join("") +
      "</div>" +
      '<p class="bar-tip" id="bar-tip"><b>' +
      esc(sel.name) +
      "</b> · Investimento previsto <b>" +
      brl(sel.value) +
      "</b> · Participação <b>" +
      pct(sel.value, total) +
      "</b></p></div>";
    h +=
      '<div class="card"><span class="lbl">Distribuição</span><h4>Composição do investimento</h4><span class="sub">Participação por frente de trabalho</span>' +
      '<div class="distbar">' +
      o.composition
        .map(function (c) {
          return '<i style="--f:' + c.value + ";--c:" + c.color + '"></i>';
        })
        .join("") +
      "</div>" +
      '<div class="dist-rows">' +
      o.composition
        .map(function (c) {
          return (
            '<div><span style="--c:' +
            c.color +
            '">' +
            esc(c.name) +
            "</span><b>" +
            brl(c.value) +
            "</b><em>" +
            pct(c.value, compTotal) +
            "</em></div>"
          );
        })
        .join("") +
      "</div></div></div>";
    h += '<div class="alert" role="note"><div><b>' + esc(o.alert.title) + "</b>" + esc(o.alert.text) + "</div></div>";
    h +=
      '<div class="card"><h4>Jornada do lançamento</h4><span class="sub">Etapa atual · ' +
      esc(
        o.journey.filter(function (j) {
          return j.state === "cur";
        })[0].name,
      ) +
      "</span>" +
      '<div class="stepper" role="group" aria-label="Etapas do lançamento">' +
      o.journey
        .map(function (j, i) {
          return (
            '<button type="button" class="' +
            j.state +
            '" data-step="' +
            i +
            '" aria-pressed="' +
            (i === state.stepSel) +
            '"><span class="dm" aria-hidden="true"></span><b>' +
            esc(j.name) +
            "</b><small>" +
            esc(j.period) +
            "</small></button>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="step-info" id="step-info">' +
      stepInfo(step) +
      "</div></div>";
    return h;
  };
  function stepInfo(j) {
    var st = j.state === "done" ? chip("Concluído") : j.state === "cur" ? chip("Em andamento") : chip("A iniciar");
    var rec = state.records.estrategia.filter(function (r) {
      return r.name.indexOf(j.name) > -1;
    })[0];
    return (
      "<b>" +
      esc(j.name) +
      '</b><span class="mono">' +
      esc(j.period) +
      "</span>" +
      st +
      (rec ? "<span>" + rec.done + " / " + rec.total + " ações concluídas</span>" : "")
    );
  }

  screens.processos = function () {
    var items = D.processes.filter(function (p) {
      return (state.procType === "Todas" || p.type === state.procType) && (!state.procDay || p.date === state.procDay);
    });
    var counts = {};
    D.processes.forEach(function (p) {
      if (state.procType === "Todas" || p.type === state.procType) counts[p.date] = (counts[p.date] || 0) + 1;
    });
    var types = ["Todas", "Estratégia", "Cronograma", "Mídia digital"];
    var h = head("Processos", "Trajetória das tarefas, mensagens, correções e decisões ao longo dos dias.");
    h +=
      '<div class="toolbar"><label class="note" for="proc-type">Atividades</label><select class="ctl" id="proc-type">' +
      types
        .map(function (t) {
          return (
            "<option" +
            (t === state.procType ? " selected" : "") +
            ">" +
            (t === "Todas" ? "Todas as atividades" : t) +
            "</option>"
          );
        })
        .join("") +
      "</select></div>";
    h +=
      '<div class="proc"><div class="card"><div class="cal-h"><h4>Outubro de 2026</h4></div><div class="cal">' +
      ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
        .map(function (d) {
          return '<span class="dw">' + d + "</span>";
        })
        .join("") +
      "<span></span><span></span><span></span>";
    for (var d = 1; d <= 31; d++) {
      var iso = "2026-10-" + (d < 10 ? "0" + d : d),
        n = counts[iso];
      h +=
        '<button type="button" data-day="' +
        iso +
        '" aria-pressed="' +
        (state.procDay === iso) +
        '"' +
        (n ? "" : " disabled") +
        (iso === D.project.today ? ' class="today"' : "") +
        ' aria-label="' +
        d +
        " de outubro" +
        (n ? ", " + n + " atividades" : ", sem atividades") +
        '"><span>' +
        d +
        "</span>" +
        (n ? "<em>" + n + "</em>" : "") +
        "</button>";
    }
    h +=
      '</div><div class="toolbar" style="margin-bottom:0"><button class="b" type="button" data-day="">Todo o mês</button><button class="b" type="button" data-day="' +
      D.project.today +
      '">Hoje</button></div>' +
      '<p class="note">Os números indicam as atividades do dia. Data de referência da demonstração: 13/10/2026.</p></div>';
    h +=
      '<div class="card"><h4>Trajetória das tarefas</h4><span class="sub">' +
      items.length +
      " de " +
      D.processes.length +
      " atividades</span>";
    if (!items.length) {
      h += '<div class="empty" style="margin-top:12px">Nenhuma atividade neste filtro.</div>';
    } else {
      var last = "";
      h += '<div class="timeline">';
      items
        .slice()
        .reverse()
        .forEach(function (p) {
          var dt = p.date.split("-").reverse().join("/");
          if (dt !== last) {
            h += '<div class="lbl" style="margin-top:6px">' + dt + "</div>";
            last = dt;
          }
          h +=
            '<div class="tl-item"><div class="card"><div class="tl-top"><b>Status alterado</b><time>' +
            dt +
            ", " +
            p.time +
            '</time></div><div class="meta">' +
            esc(p.by) +
            " · Histórico da tarefa · " +
            esc(p.type) +
            '</div><span class="task">' +
            esc(p.task) +
            '</span><div class="chg">' +
            chip(p.from) +
            '<span aria-hidden="true">→</span><span class="sr-only">para</span>' +
            chip(p.to) +
            "</div></div></div>";
        });
      h += "</div>";
    }
    return h + "</div></div>";
  };

  screens.planejador = function () {
    var P = state.planner;
    var total = P.distribution.reduce(function (a, d) {
      return a + d.value;
    }, 0);
    var digital = P.distribution
      .filter(function (d) {
        return d.digital;
      })
      .reduce(function (a, d) {
        return a + d.value;
      }, 0);
    var leads = Math.round(digital / (P.cpl || 1));
    var sales = Math.round((leads * P.conversion) / 100);
    var h = head("Planejador MICCA", "Plano integrado de canais, orçamento, cronograma e funil comercial.");
    h +=
      '<p class="lbl" style="margin-bottom:4px">Plano integrado on + off</p><p class="note" style="margin-bottom:12px">Valores de referência · revise as premissas antes de executar</p>';
    h +=
      '<div class="card"><h4>Configuração do plano</h4><div class="cfg" style="margin-top:12px">' +
      '<div class="wide"><small>Nome do plano</small><b>' +
      esc(P.name) +
      "</b></div>" +
      "<div><small>Localização</small><b>" +
      esc(P.location) +
      "</b></div>" +
      '<div id="cf-duration"><small>Duração (dias)</small><b>' +
      P.duration +
      "</b></div>" +
      '<div id="cf-units"><small>Unidades</small><b>' +
      P.units +
      "</b></div>" +
      '<div id="cf-cpl"><small>CPL digital de referência (R$)</small><b>' +
      P.cpl +
      "</b></div>" +
      "<div><small>Contingência (%)</small><b>" +
      P.contingency +
      "</b></div>" +
      "<div><small>Conversão lead → venda</small><b>" +
      P.conversion.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) +
      "%</b></div>" +
      "</div></div>";
    h +=
      '<div class="card brief" style="margin-top:12px"><h4>Briefing por prompt</h4><p class="note" style="margin:4px 0 10px">Interpretação local de nome, duração, unidades, CPL e canais. Revise quantidades e preços após interpretar.</p>' +
      '<label class="sr-only" for="brief-txt">Briefing do lançamento</label><textarea id="brief-txt">' +
      esc(P.briefing) +
      "</textarea>" +
      '<div class="toolbar"><button class="b p" type="button" id="brief-run">Interpretar briefing</button><span class="note" id="brief-msg" role="status">Edite o texto e interprete: a demonstração identifica duração, unidades, CPL e canais.</span></div>' +
      '<div class="chips-row" aria-label="Canais identificados">' +
      P.channels
        .map(function (c) {
          return '<span class="chip in">' + esc(c) + "</span>";
        })
        .join("") +
      "</div></div>";
    h +=
      '<div class="tabs-static"><span class="cur">Visão executiva</span><span>Outras abas da plataforma: Selecionar mídias · Mídia e custos · Cronograma · Método MICCA · Entregáveis · Atendimento · Funil imobiliário</span></div>';
    h +=
      '<div class="grid-k">' +
      '<div class="card kpi"><small>Investimento total</small><b>' +
      brl(total, true) +
      "</b><em>Inclui contingência</em></div>" +
      '<div class="card kpi"><small>Digital</small><b>' +
      brl(digital, true) +
      "</b><em>Somente canais de performance classificados</em></div>" +
      '<div class="card kpi"><small>Offline / apoio</small><b>' +
      brl(total - digital, true) +
      "</b><em>Rádio, outdoor, impresso e PDV</em></div>" +
      '<div class="card kpi"><small>Leads digitais</small><b>' +
      leads.toLocaleString("pt-BR") +
      "</b><em>Projeção condicionada ao CPL</em></div></div>";
    h +=
      '<div class="row2"><div class="card"><h4>Distribuição do investimento</h4><div class="distbar">' +
      P.distribution
        .map(function (d) {
          return '<i style="--f:' + d.value + ";--c:" + d.color + '"></i>';
        })
        .join("") +
      "</div>" +
      P.distribution
        .map(function (d) {
          return (
            '<div class="ln"><span style="--c:' +
            d.color +
            '">' +
            esc(d.name) +
            "</span><b>" +
            brl(d.value, true) +
            " · " +
            pct(d.value, total, 2) +
            "</b></div>"
          );
        })
        .join("") +
      '</div><div class="card"><h4>Composição do orçamento</h4>' +
      '<div class="ln"><span>Mídias</span><b>' +
      brl(total, true) +
      '</b></div><div class="ln"><span>Contingência</span><b>' +
      brl(0, true) +
      '</b></div><div class="ln"><span>Total</span><b>' +
      brl(total, true) +
      "</b></div>" +
      '<div class="ln"><span>Vendas digitais teóricas</span><b>' +
      sales +
      "</b></div>" +
      '<p class="note" style="margin-top:10px">Leads e vendas são projeções baseadas somente na verba digital classificada. Atribua conversões offline apenas com rastreamento validado.</p></div></div>';
    h +=
      '<div class="row2" style="grid-template-columns:1fr 1fr"><div class="card"><span class="lbl">Objetivo</span><p style="margin-top:6px">' +
      esc(P.objective) +
      '</p></div><div class="card"><span class="lbl">Estratégia</span><p style="margin-top:6px">' +
      esc(P.strategy) +
      "</p></div></div>";
    h +=
      '<p class="note">Custos ilustrativos, não cotações. Valide orçamentos, licenças, datas e fornecedores antes da execução.</p>';
    return h;
  };

  function interpretBriefing() {
    var ta = document.getElementById("brief-txt"),
      msg = document.getElementById("brief-msg");
    if (!ta) return;
    var t = ta.value,
      P = state.planner,
      found = [];
    var mDur = t.match(/(\d{1,4})\s*dias/i);
    var mUni = t.match(/(\d{1,5})\s*(?:casas|apartamentos|unidades|lotes|aptos)/i);
    var mCpl = t.match(/CPL[^0-9]{0,12}(\d{1,5}(?:[.,]\d{1,2})?)/i);
    if (mDur) {
      P.duration = parseInt(mDur[1], 10);
      found.push("duração");
    }
    if (mUni) {
      P.units = parseInt(mUni[1], 10);
      found.push("unidades");
    }
    if (mCpl) {
      P.cpl = parseFloat(mCpl[1].replace(",", ".")) || P.cpl;
      found.push("CPL");
    }
    var ch = P.knownChannels.filter(function (c) {
      return new RegExp(c.replace(/\s+/g, "\\s*"), "i").test(t);
    });
    if (ch.length) {
      P.channels = ch;
      found.push(ch.length + " canais");
    }
    P.briefing = t;
    render("planejador", true);
    var m2 = document.getElementById("brief-msg");
    if (m2)
      m2.textContent = found.length
        ? "Identificado: " + found.join(", ") + ". Simulação local, nada foi salvo."
        : 'Nada identificado. Inclua, por exemplo, "60 dias", "320 unidades", "CPL de R$ 30" e os canais.';
    ["cf-duration", "cf-units", "cf-cpl"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.classList.add("flash");
        setTimeout(function () {
          el.classList.remove("flash");
        }, 900);
      }
    });
  }

  screens.campanhas = function () {
    var list = D.campaigns.filter(function (c) {
      return state.campFilter === "all" || c.open;
    });
    var h = head(
      "Campanhas e aprovações",
      "Planejamento, revisão interna de artes e acompanhamento das campanhas em veiculação.",
    );
    h +=
      '<div class="card"><h4>Revisão interna de artes</h4><span class="sub">O time revisa primeiro. Apenas versões aprovadas podem ser enviadas ao cliente.</span></div>';
    h +=
      '<div class="toolbar"><label class="note" for="camp-f">Mostrar campanhas</label><select class="ctl" id="camp-f"><option value="open"' +
      (state.campFilter === "open" ? " selected" : "") +
      '>Em aberto</option><option value="all"' +
      (state.campFilter === "all" ? " selected" : "") +
      '>Todas</option></select><span class="note">' +
      list.length +
      " campanhas</span></div>";
    h +=
      '<div class="camp">' +
      list
        .map(function (c) {
          var idx = D.campaigns.indexOf(c);
          var n = { wn: 0, cr: 0, ok: 0 };
          c.reviews.forEach(function (r) {
            n[r.chip]++;
          });
          var open = !!state.openReviews[idx];
          var arts = c.arts.length
            ? '<div class="arts" aria-label="Prévia das artes (ilustração)">' +
              c.arts
                .map(function (a) {
                  return '<span class="art ' + a + '" role="img" aria-label="Arte ilustrativa"></span>';
                })
                .join("") +
              "</div>"
            : '<div class="empty" style="margin:12px 0;padding:16px">Nenhuma arte anexada a esta campanha.</div>';
          return (
            '<div class="card"><div class="camp-h"><div><span class="k">Campanha</span><h4>' +
            esc(c.name) +
            '</h4><span class="sub">' +
            esc(c.period) +
            " · " +
            esc(c.owner) +
            "</span></div>" +
            chip(c.status) +
            "</div>" +
            '<span class="lbl" style="display:block;margin-top:12px">Prévia das artes</span>' +
            arts +
            '<p class="counts">' +
            n.wn +
            " aguardando aprovação · " +
            n.cr +
            " com ajustes · " +
            n.ok +
            " aprovados</p>" +
            (c.reviews.length
              ? '<button class="b" type="button" data-rev="' +
                idx +
                '" aria-expanded="' +
                open +
                '" aria-controls="rev-' +
                idx +
                '">' +
                (open ? "Ocultar revisões internas" : "Ver revisões internas") +
                "</button>"
              : "") +
            '<div class="revs" id="rev-' +
            idx +
            '"' +
            (open ? "" : " hidden") +
            ">" +
            c.reviews
              .map(function (r) {
                return (
                  '<div class="rev"><span>' +
                  esc(r.piece) +
                  '</span><span class="chip ' +
                  r.chip +
                  '">' +
                  esc(r.state) +
                  "</span></div>"
                );
              })
              .join("") +
            "</div></div>"
          );
        })
        .join("") +
      "</div>";
    return h;
  };

  function recordsScreen(key, title) {
    var recs = state.records[key],
      f = state.filter[key],
      view = state.view[key];
    var shown = recs.filter(function (r) {
      return f === "Todos" || r.status === f;
    });
    var sub = recs.length + " registros conectados ao plano de lançamento.";
    var h = head(title, sub);
    h +=
      '<div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div><h4>Registros do plano</h4><span class="sub">' +
      shown.length +
      " de " +
      recs.length +
      " registros</span></div>" +
      '<div class="seg" role="group" aria-label="Modo de visualização"><button type="button" data-view="list" aria-pressed="' +
      (view === "list") +
      '">Lista</button>' +
      '<button type="button" data-view="kanban" aria-pressed="' +
      (view === "kanban") +
      '">Kanban</button></div></div>';
    var statuses = ["Todos"].concat(D.kanbanColumns);
    h +=
      '<div class="toolbar"><label class="note" for="rf-' +
      key +
      '">Status</label><select class="ctl" id="rf-' +
      key +
      '" data-filter="' +
      key +
      '">' +
      statuses
        .map(function (s) {
          return "<option" + (s === f ? " selected" : "") + ">" + esc(s) + "</option>";
        })
        .join("") +
      '</select><span class="grow"></span>' +
      (view === "kanban"
        ? '<span class="note">Use os botões ou Alt + ← / → no cartão para mover entre colunas. Mudança local, só nesta demonstração.</span>'
        : '<span class="note">Abra um registro para ver os detalhes.</span>') +
      "</div>";
    if (!shown.length) return h + '<div class="empty">Nenhum registro neste filtro.</div>';
    if (view === "list") {
      h +=
        '<div class="rec-list">' +
        shown
          .map(function (r) {
            return recRow(key, r);
          })
          .join("") +
        "</div>";
    } else {
      var cols = f === "Todos" ? D.kanbanColumns : [f];
      h +=
        '<div class="kanban">' +
        cols
          .map(function (col) {
            var items = shown.filter(function (r) {
              return r.status === col;
            });
            return (
              '<div class="kcol" role="group" aria-label="' +
              esc(col) +
              '"><div class="kcol-h">' +
              chip(col) +
              "<span>" +
              items.length +
              "</span></div>" +
              (items.length
                ? items
                    .map(function (r) {
                      return kCard(key, r);
                    })
                    .join("")
                : '<div class="k-empty">Sem registros</div>') +
              "</div>"
            );
          })
          .join("") +
        "</div>";
    }
    return h;
  }
  var KIND = { estrategia: "Estratégia", cronograma: "Cronograma", midia: "Mídia digital" };
  function progress(r) {
    if (r.total == null) return "";
    var p = r.total ? Math.round((r.done / r.total) * 100) : 0;
    return { p: p, label: r.done + " / " + r.total + " · " + p + "%" };
  }
  function recRow(key, r) {
    var pg = progress(r);
    var pgLabel = key === "estrategia" ? "Conclusão da estratégia" : "Produções vinculadas entregues";
    return (
      '<div class="rec" style="--sc:' +
      scColor(r.status) +
      '"><span class="ico" aria-hidden="true">' +
      (ICON[key] || "") +
      "</span>" +
      '<div><span class="k">' +
      KIND[key] +
      "</span><h5>" +
      esc(r.name) +
      '</h5><span class="sub">' +
      esc(r.sub) +
      "</span></div>" +
      '<div class="f"><small>Período / prazo</small><span class="mono">' +
      esc(r.period) +
      "</span></div>" +
      '<div class="f hide-m"><small>Responsável</small><span>' +
      esc(r.owner) +
      "</span></div>" +
      '<div class="f"><small>Status</small>' +
      chip(r.status) +
      "</div>" +
      '<div class="f hide-m"><small>' +
      (r.invest ? "Investimento" : "Entregas") +
      "</small><span>" +
      esc(r.invest || (pg ? pg.label : "—")) +
      "</span></div>" +
      '<button class="open" type="button" data-open="' +
      key +
      ":" +
      r.id +
      '" aria-label="Abrir detalhes de ' +
      esc(r.name) +
      '"><i></i></button>' +
      (pg && key !== "midia"
        ? '<div class="pg"><span>' +
          pgLabel +
          "</span><b>" +
          pg.label +
          '</b><span class="track"><i style="--w:' +
          pg.p +
          '%"></i></span>' +
          (r.elapsed ? "<span>" + esc(r.elapsed) + "</span>" : "") +
          "</div>"
        : "") +
      "</div>"
    );
  }
  function kCard(key, r) {
    var pg = progress(r),
      ci = D.kanbanColumns.indexOf(r.status);
    return (
      '<div class="kcard" tabindex="0" data-card="' +
      key +
      ":" +
      r.id +
      '" style="--sc:' +
      scColor(r.status) +
      '" aria-label="' +
      esc(r.name) +
      ", " +
      esc(r.status) +
      '. Alt mais seta para mover.">' +
      '<span class="k">' +
      KIND[key] +
      "</span><h5>" +
      esc(r.name) +
      '</h5><span class="p">' +
      esc(r.period) +
      "</span>" +
      (pg && key !== "midia"
        ? '<div class="pg">' +
          (key === "estrategia" ? "Conclusão" : "Produções entregues") +
          " · " +
          pg.label +
          '<div class="track"><i style="--w:' +
          pg.p +
          '%"></i></div></div>'
        : '<div class="pg">' + esc(r.invest || "") + "</div>") +
      '<div class="kmove"><button type="button" class="l" data-move="' +
      key +
      ":" +
      r.id +
      ':-1" aria-label="Mover para ' +
      esc(D.kanbanColumns[ci - 1] || "") +
      '"' +
      (ci <= 0 ? " disabled" : "") +
      "><i></i></button>" +
      '<label class="sr-only" for="st-' +
      r.id +
      '">Status de ' +
      esc(r.name) +
      "</label>" +
      '<select class="ctl" id="st-' +
      r.id +
      '" data-setstatus="' +
      key +
      ":" +
      r.id +
      '">' +
      D.kanbanColumns
        .map(function (c) {
          return "<option" + (c === r.status ? " selected" : "") + ">" + esc(c) + "</option>";
        })
        .join("") +
      "</select>" +
      '<button type="button" data-move="' +
      key +
      ":" +
      r.id +
      ':1" aria-label="Mover para ' +
      esc(D.kanbanColumns[ci + 1] || "") +
      '"' +
      (ci >= D.kanbanColumns.length - 1 ? " disabled" : "") +
      "><i></i></button>" +
      '<button type="button" class="kopen" data-open="' +
      key +
      ":" +
      r.id +
      '" aria-label="Abrir detalhes de ' +
      esc(r.name) +
      '">Abrir registro</button></div></div>'
    );
  }
  screens.estrategia = function () {
    return recordsScreen("estrategia", "Estratégia");
  };
  screens.cronograma = function () {
    return recordsScreen("cronograma", "Cronograma");
  };
  screens.midia = function () {
    return recordsScreen("midia", "Mídia digital");
  };

  // ---------------------------------------------------------------- modal
  var lastFocus = null;
  function openRecord(ref) {
    var p = ref.split(":"),
      key = p[0],
      id = p[1];
    var r = state.records[key].filter(function (x) {
      return x.id === id;
    })[0];
    if (!r || !modal) return;
    document.getElementById("dlg-title").textContent = r.name;
    document.getElementById("dlg-sub").textContent = KIND[key] + " · registro de exemplo";
    var fields = r.detail || {
      Status: r.status,
      "Período / prazo": r.period,
      Responsável: r.owner,
      Vínculo: r.sub,
      Progresso:
        r.total != null
          ? r.done + " de " + r.total + (key === "estrategia" ? " ações concluídas" : " produções entregues")
          : "—",
      Investimento: r.invest || "Não se aplica",
    };
    var body = '<div style="grid-column:1/-1">' + chip(r.status) + "</div>";
    Object.keys(fields).forEach(function (k) {
      body += '<div><span class="lbl">' + esc(k) + "</span><p>" + esc(fields[k]) + "</p></div>";
    });
    if (r.elapsed)
      body += '<div style="grid-column:1/-1"><span class="lbl">Período</span><p>' + esc(r.elapsed) + "</p></div>";
    document.getElementById("dlg-body").innerHTML = body;
    lastFocus = document.activeElement;
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
  }
  function closeModal() {
    if (!modal) return;
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
  }
  if (modal) {
    document.getElementById("dlg-close").addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
    modal.addEventListener("close", function () {
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
  }

  // ---------------------------------------------------------------- Kanban
  function moveCard(key, id, dir, absolute) {
    var r = state.records[key].filter(function (x) {
      return x.id === id;
    })[0];
    if (!r) return;
    var cols = D.kanbanColumns,
      i = cols.indexOf(r.status);
    var ni = absolute != null ? cols.indexOf(absolute) : Math.max(0, Math.min(cols.length - 1, i + dir));
    if (ni === i || ni < 0) return;
    r.status = cols[ni];
    render(key, true);
    var card = screenEl.querySelector('[data-card="' + key + ":" + id + '"]');
    if (card) {
      card.classList.add("moved");
      card.focus({ preventScroll: true });
      card.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduce ? "auto" : "smooth" });
    }
  }

  // ---------------------------------------------------------------- render e navegação
  var SUB = {};
  tabs.forEach(function (t) {
    var s = t.querySelector(".ctx");
    SUB[t.dataset.screen] = { name: t.querySelector("b").textContent, ctx: s ? s.textContent : "" };
  });

  function render(key, keepScroll) {
    state.current = key;
    var top = main.scrollTop;
    screenEl.innerHTML = screens[key]();
    screenEl.classList.remove("enter");
    if (!keepScroll) {
      void screenEl.offsetWidth;
      if (!reduce) screenEl.classList.add("enter");
      main.scrollTop = 0;
      // gráficos crescem depois da transição
      if (!reduce) {
        screenEl.classList.add("is-pre");
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            screenEl.classList.remove("is-pre");
          });
        });
      }
    } else {
      main.scrollTop = top;
    }
    crumb.textContent = SUB[key].name;
    if (ctxEl) ctxEl.innerHTML = "<b>" + esc(SUB[key].name) + ".</b> " + esc(SUB[key].ctx);
    tabs.forEach(function (t) {
      var on = t.dataset.screen === key;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      if (on) main.setAttribute("aria-labelledby", t.id);
    });
    sideBtns.forEach(function (b) {
      if (b.dataset.screen === key) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }

  function go(key, focusPanel) {
    if (!screens[key]) return;
    render(key);
    if (focusPanel) main.focus({ preventScroll: true });
  }

  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () {
      go(t.dataset.screen);
    });
    t.addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (i + 1) % tabs.length;
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") n = 0;
      if (e.key === "End") n = tabs.length - 1;
      if (n !== null) {
        e.preventDefault();
        tabs[n].focus();
        go(tabs[n].dataset.screen);
      }
    });
  });
  sideBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      go(b.dataset.screen);
    });
  });

  // delegação de eventos dentro das telas
  screenEl.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.phase != null) {
      state.phaseSel = +t.dataset.phase;
      var o = D.overview,
        total = o.phases.reduce(function (a, p) {
          return a + p.value;
        }, 0),
        p = o.phases[state.phaseSel];
      screenEl.querySelectorAll("[data-phase]").forEach(function (b) {
        b.setAttribute("aria-pressed", b === t);
      });
      document.getElementById("bar-tip").innerHTML =
        "<b>" +
        esc(p.name) +
        "</b> · Investimento previsto <b>" +
        brl(p.value) +
        "</b> · Participação <b>" +
        pct(p.value, total) +
        "</b>";
    } else if (t.dataset.step != null) {
      state.stepSel = +t.dataset.step;
      screenEl.querySelectorAll("[data-step]").forEach(function (b) {
        b.setAttribute("aria-pressed", b === t);
      });
      document.getElementById("step-info").innerHTML = stepInfo(D.overview.journey[state.stepSel]);
    } else if (t.dataset.day != null) {
      state.procDay = t.dataset.day || null;
      render("processos", true);
    } else if (t.id === "brief-run") {
      interpretBriefing();
    } else if (t.dataset.rev != null) {
      var i = +t.dataset.rev;
      state.openReviews[i] = !state.openReviews[i];
      render("campanhas", true);
      var again = screenEl.querySelector('[data-rev="' + i + '"]');
      if (again) again.focus();
    } else if (t.dataset.view) {
      state.view[state.current] = t.dataset.view;
      render(state.current, true);
    } else if (t.dataset.open) {
      openRecord(t.dataset.open);
    } else if (t.dataset.move) {
      var m = t.dataset.move.split(":");
      moveCard(m[0], m[1], +m[2]);
    }
  });
  screenEl.addEventListener("mouseover", function (e) {
    var t = e.target.closest("[data-phase]");
    if (t && t.getAttribute("aria-pressed") !== "true") t.click();
  });
  screenEl.addEventListener("change", function (e) {
    var t = e.target;
    if (t.id === "proc-type") {
      state.procType = t.value.indexOf("Todas") === 0 ? "Todas" : t.value;
      state.procDay = null;
      render("processos", true);
    } else if (t.id === "camp-f") {
      state.campFilter = t.value;
      render("campanhas", true);
    } else if (t.dataset.filter) {
      state.filter[t.dataset.filter] = t.value;
      render(t.dataset.filter, true);
    } else if (t.dataset.setstatus) {
      var p = t.dataset.setstatus.split(":");
      moveCard(p[0], p[1], 0, t.value);
    }
  });
  screenEl.addEventListener("keydown", function (e) {
    var card = e.target.closest && e.target.closest("[data-card]");
    if (card && e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      e.preventDefault();
      var p = card.dataset.card.split(":");
      moveCard(p[0], p[1], e.key === "ArrowRight" ? 1 : -1);
    } else if (card && e.target === card && e.key === "Enter") {
      openRecord(card.dataset.card);
    }
  });

  // links externos que abrem uma tela específica (jornada, MICCA)
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-screen]");
    if (!a || a.closest("#sc-menu") || a.closest(".app-side")) return;
    if (screens[a.dataset.screen]) go(a.dataset.screen);
  });

  render("visao");
}
