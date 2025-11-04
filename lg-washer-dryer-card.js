const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;

const CARD_VERSION = '1.0.0';

console.info(
  `%c  LG-THINQ-CARDS \n%c  Version ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

const cssUrl = '/hacsfiles/lg-washer-dryer-card/7segment.css';
if (!document.querySelector(`link[href="${cssUrl}"]`)) {
  const styleElement = document.createElement('link');
  styleElement.setAttribute('rel', 'stylesheet');
  styleElement.setAttribute('href', cssUrl);
  document.head.appendChild(styleElement);
}


class LGThinQBaseCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity");
    }
    if (!config.run_state_entity) {
        throw new Error("You need to define a run_state_entity");
    }
    this.config = config;
  }

  getCardSize() {
    return 3;
  }

  render() {
    throw new Error("Render method must be implemented in child class");
  }

  _getFormattedTime(entity) {
    const runState = this.hass.states[this.config.run_state_entity]?.state;
    if (runState === '-' || runState === 'unavailable' || runState === 'Standby') {
        return '-:--';
    }
    const remainTime = this.hass.states[entity]?.attributes?.remain_time;
    if (remainTime) {
        return remainTime.split(":").slice(0, 2).join(":");
    }
    return ' ';
  }

  _renderImage(icon, entity, state, top, left, width = '20%') {
    const stateImage = state ? `${icon}-on.png` : `${icon}.png`;
    const path = `/hacsfiles/lg-washer-dryer-card/images/`;
    return html`
      <img
        src="${path}${stateImage}"
        style="
          top: ${top};
          left: ${left};
          width: ${width};
          position: absolute;
          image-rendering: crisp;
        "
      />
    `;
  }

  _renderTimeDisplay() {
    const time = this._getFormattedTime(this.config.entity);
    return html`
      <div
        style="
          color: #555;
          font-family: segment7;
          font-size: 50px;
          position: absolute;
          left: 95%;
          top: 74%;
          transform: translate(-100%, -50%);
        "
      >18:88</div>
      <div
        style="
          color: #8df427;
          font-family: segment7;
          font-size: 50px;
          position: absolute;
          left: 95%;
          top: 74%;
          transform: translate(-100%, -50%);
        "
      >${time}</div>
    `;
  }

  _renderDetails() {
    const runState = this.hass.states[this.config.run_state_entity]?.state;
    if (runState === '-' || runState === 'unavailable') {
      return html``;
    }

    const attributes = this.hass.states[this.config.entity]?.attributes;

    return html`
      <ha-card>
        <div class="card-content">
          ${this.config.details.map(detail => {
            return html`
              <div class="info-row">
                <ha-icon icon="${detail.icon}"></ha-icon>
                <div class="name">${detail.name}</div>
                <div class="state">${attributes[detail.attribute]}</div>
              </div>
            `;
          })}
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return html`
      <style>
        .info-row {
          display: flex;
          align-items: center;
          padding: 4px 0;
        }
        .info-row ha-icon {
          margin-right: 16px;
          color: var(--paper-item-icon-color);
        }
        .info-row .name {
          flex: 1;
        }
        .info-row .state {
          color: var(--primary-text-color);
        }
      </style>
    `;
  }
}

class LGWasherCard extends LGThinQBaseCard {
  setConfig(config) {
    super.setConfig(config);
    if (!config.door_lock_entity) {
        throw new Error("You need to define a door_lock_entity");
    }
    this.config.details = [
        { name: "Current Course", attribute: "current_course", icon: "mdi:tune-vertical-variant" },
        { name: "Water Temperature", attribute: "water_temp", icon: "mdi:coolant-temperature" },
        { name: "Spin Speed", attribute: "spin_speed", icon: "mdi:rotate-right" },
    ];
  }

  render() {
    const runState = this.hass.states[this.config.run_state_entity]?.state;
    const mainEntity = this.hass.states[this.config.entity];
    const doorLock = this.hass.states[this.config.door_lock_entity];

    return html`
      <ha-card>
        <div style="position: relative;">
          <img src="/hacsfiles/lg-washer-dryer-card/images/hass-washer-card-bg.png" style="width: 100%;" />
          ${this._renderImage('sensing', this.config.run_state_entity, runState === 'Detecting', '33%', '33%')}
          ${this._renderImage('wash', this.config.run_state_entity, runState === 'Washing', '33%', '51%')}
          ${this._renderImage('rinse', this.config.run_state_entity, runState === 'Rinsing', '33%', '69%')}
          ${this._renderImage('spin', this.config.run_state_entity, runState === 'Spinning', '33%', '87%')}
          ${this._renderImage('wifi', this.config.entity, mainEntity?.state === 'on', '73%', '32%', '10%')}
          ${this._renderImage('lock', this.config.door_lock_entity, doorLock?.state === 'on', '73%', '45%', '10%')}
          ${this._renderTimeDisplay()}
        </div>
        ${this._renderDetails()}
      </ha-card>
    `;
  }
}

customElements.define("lg-washer-card", LGWasherCard);

class LGDryerCard extends LGThinQBaseCard {
    setConfig(config) {
        super.setConfig(config);
        this.config.details = [
            { name: "Current Course", attribute: "current_course", icon: "mdi:tune-vertical-variant" },
            { name: "Temperature Control", attribute: "temp_control", icon: "mdi:thermometer" },
            { name: "Dry Level", attribute: "dry_level", icon: "mdi:air-filter" },
        ];
    }

    render() {
        const runState = this.hass.states[this.config.run_state_entity]?.state;
        const mainEntity = this.hass.states[this.config.entity];

        return html`
            <ha-card>
                <div style="position: relative;">
                    <img src="/hacsfiles/lg-washer-dryer-card/images/hass-dryer-card-bg.png" style="width: 100%;" />
                    ${this._renderImage('dry', this.config.run_state_entity, runState === 'Drying', '33%', '69%')}
                    ${this._renderImage('cool', this.config.run_state_entity, runState === 'Cooling', '33%', '87%')}
                    ${this._renderImage('wifi', this.config.entity, mainEntity?.state === 'on', '73%', '32%', '10%')}
                    ${this._renderTimeDisplay()}
                </div>
                ${this._renderDetails()}
            </ha-card>
        `;
    }
}

customElements.define("lg-dryer-card", LGDryerCard);


// Configuration UI for the cards

const cardTypes = {
    'washer': {
        name: 'LG Washer Card',
        description: 'A card for LG ThinQ Washing Machines.',
        preview: true,
        documentationURL: 'https://github.com/m1ckyb/lg-washer-dryer-card',
        entities: ['entity', 'run_state_entity', 'door_lock_entity']
    },
    'dryer': {
        name: 'LG Dryer Card',
        description: 'A card for LG ThinQ Dryers.',
        preview: true,
        documentationURL: 'https://github.com/m1ckyb/lg-washer-dryer-card',
        entities: ['entity', 'run_state_entity']
    }
};

for (const [type, config] of Object.entries(cardTypes)) {
    const editor = class extends LitElement {
        static get properties() {
            return { hass: {}, _config: {} };
        }

        setConfig(config) {
            this._config = config;
        }

        render() {
            if (!this.hass) return html``;

            return html`
                <div class="card-config">
                    ${config.entities.map(entityConf => {
                        return html`
                            <ha-entity-picker
                                .label="${entityConf.replace('_', ' ')}"
                                .hass=${this.hass}
                                .value=${this._config[entityConf]}
                                .configValue=${entityConf}
                                @value-changed=${this._valueChanged}
                                allow-custom-entity
                            ></ha-entity-picker>
                        `;
                    })}
                </div>
            `;
        }

        _valueChanged(ev) {
            if (!this._config || !this.hass) return;
            const { target } = ev;
            const newConfig = { ...this._config, [target.configValue]: target.value };
            this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: newConfig } }));
        }
    };

    customElements.define(`lg-${type}-card-editor`, editor);
    window.customCards = window.customCards || [];
    window.customCards.push({
        type: `lg-${type}-card`,
        name: config.name,
        description: config.description,
        preview: config.preview,
        documentationURL: config.documentationURL,
        editMode: `lg-${type}-card-editor`,
    });
}