import withStyles from 'material-ui/styles/withStyles';
import React from 'react';
import Blip from './blip';

class Blips extends React.PureComponent {

  constructor(props) {
    super(props);
    this.blip = this.blip.bind(this);
    this.onChanges = {};
    this.onCreates = [
      this.onCreate(0),
      this.onCreate(1),
      this.onCreate(2)
    ];
  }

  blip(blip, index) {
    const [ timestamp, mode, inner, outer ] = blip;
    const create = index === -1;
    return (
      <div
        className={
          this.props.classes.blip +
          (create ? ' ' + this.props.classes.currentBlip : '')
        }
        key={timestamp}
        style={this.blipRootStyle(timestamp, create)}
      >
        <Blip
          intensity={outer}
          mode={mode}
          onIntensityChange={this.onChange(index, 2)}
          onModeChange={this.onChange(index, 0)}
        />
        <Blip
          intensity={inner}
          mode={mode}
          onIntensityChange={this.onChange(index, 1)}
          onModeChange={this.onChange(index, 0)}
          reverse
        />
      </div>
    );
  }

  blipRootStyle(timestamp, create) {
    if (create) {
      return null;
    }
    return {
      left: 'calc(' + timestamp / this.props.duration + ' * ' + this.width + ')'
    };
  }

  get closestBlip() {
    let x = 0;
    while (
      x > 1 &&
      this.props.blips[x][0] > this.props.currentTimestamp
    ) {
      --x;
    }
    const closest = this.props.blips[x].slice(0);
    closest.shift();
    return closest;
  }

  get currentBlipExists() {
    for (const [ timestamp ] of this.props.blips) {
      if (timestamp === this.props.currentTime) {
        return true;
      }
      if (timestamp > this.props.currentTime) {
        return false;
      }
    }
    return false;
  }

  onChange(blip, index) {
    if (blip === -1) {
      return this.onCreates[index];
    }
    if (!Object.prototype.hasOwnProperty.call(this.onChanges, blip)) {
      this.onChanges[blip] = [];
    }
    if (!this.onChanges[blip][index]) {
      this.onChanges[blip][index] = (value) => {
        const blips = this.props.blips.slice(0);
        blips[blip][index + 1] = value;
        return this.props.onChange(blips);
      };
    }
    return this.onChanges[blip][index];
  }

  onCreate(index) {
    return (value) => {
      const blips = this.props.blips.slice(0);
      const blip = [ this.props.currentTime, ...this.closestBlip ];
      blip[index + 1] = value;
      blips.push(blip);
      return this.props.onChange(blips);
    }
  }

  get width() {
    // 5 blips per second
    return this.props.duration / 200 + 'em';
  }

  render() {
    const width = this.width;
    return (
      <div className={this.props.classes.root}>
        <div
          children={this.props.blips.map(this.blip)}
          className={this.props.classes.previousBlips}
          style={{
            left: 'calc(50vw - 1em - ' + (this.props.currentTime / this.props.duration) + ' * ' + width + ')',
            maxWidth: width,
            minWidth: width
          }}
        />
        <div className={this.props.classes.currentBlips}>
          {
            this.props.paused() &&
            !this.currentBlipExists ?
              <div children={this.blip([ this.props.currentTime, ...this.closestBlip ], -1)} /> :
              null
          }
        </div>
      </div>
    );
  }
}

export default withStyles((theme) => ({
  root: {
    display: 'flex',
    flexGrow: 1,
    overflow: 'hidden',
    width: '100%'
  },
  blip: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    height: '100%',
    position: 'absolute'
  },
  currentBlip: {
    opacity: '0.25'
  },
  currentBlips: {
    borderLeftColor: '#FFFFFF',
    borderLeftStyle: 'solid',
    borderLeftWidth: 1,
    flexGrow: 1,
    height: 'calc(50% - 4em)',
    left: 'calc(50vw - 1em)',
    marginLeft: '1em',
    position: 'absolute',
    '& > div': {
      marginLeft: '-1em'
    }
  },
  previousBlips: {
    flexGrow: 1,
    overflow: 'hidden',
    position: 'relative',
    transitionDelay: '0s',
    transitionDuration: '0.25s',
    transitionProperty: 'left',
    transitionTimingFunction: 'linear'
  },
  translucentBlip: {
    opacity: '0.75'
  }
}))(Blips);
