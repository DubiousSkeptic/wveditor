import withStyles from 'material-ui/styles/withStyles';
import Tooltip from 'material-ui/Tooltip';
import React from 'react';
import modeImages from './images/modes.gif';

const modeNames = [
  'Vibrate', 'Pulse', 'Wave', 'Echo',
  'Tide', 'Bounce', 'Surf', 'Cha Cha Cha'
];

class Blip extends React.PureComponent {

  constructor(props) {
    super(props);
    this.blipRef = null;
    this.dragLowerBound = 0;
    this.dragUpperBound = 0;
    this.mouseDownPageY = 0;
    this.mouseDownTime = 0;
    this.onBlipRef = this.onBlipRef.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onRootRef = this.onRootRef.bind(this);
    this.rootRef = null;
    this.state = {
      dragDistance: 0
    };
  }

  get intensity() {
    if (this.state.dragDistance !== 0) {
      const percentTop = this.blipRef.offsetTop / (this.rootRef.clientHeight - this.blipRef.offsetHeight);
      return Math.round((this.props.reverse ? percentTop : 1 - percentTop) * 16);
    }
    return this.props.intensity;
  }

  onBlipRef(blipRef) {
    this.blipRef = blipRef;
  }

  onMouseDown(e) {
    this.dragLowerBound = this.rootRef.clientHeight - this.blipRef.offsetTop - this.blipRef.offsetHeight;
    this.dragUpperBound = -1 * this.blipRef.offsetTop;
    this.mouseDownTime = new Date().getTime();
    this.mouseDownPageY = e.pageY;
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove(e) {
    const attempt = e.pageY - this.mouseDownPageY;
    const dragDistance = Math.min(Math.max(attempt, this.dragUpperBound), this.dragLowerBound);
    if (dragDistance !== this.state.dragDistance) {
      this.setState({ dragDistance });
    }
  }

  onMouseUp(e) {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.dragLowerBound = 0;
    this.dragUpperBound = 0;
    this.mouseDownPageY = 0;
    if (new Date().getTime() < this.mouseDownTime + 250) {
      this.props.onModeChange(
        (this.props.mode + 1) % 8
      );
    }
    this.mouseDownTime = 0;
    if (this.state.dragDistance !== 0) {
      const intensity = this.intensity;
      this.setState(
        {
          dragDistance: 0
        },
        intensity !== this.props.intensity ?
          () =>
            this.props.onIntensityChange(intensity) :
          null
      );
    }
  }

  onRootRef(rootRef) {
    this.rootRef = rootRef;
  }

  render() {
    const sixteenths = this.props.intensity / 16;
    const percent = this.props.reverse ? sixteenths * 100 : (1 - sixteenths) * 100;
    const ems = this.props.reverse ? sixteenths * 2 : (1 - sixteenths) * 2;
    const px =
      this.state.dragDistance > 0 ?
        ' + ' + this.state.dragDistance + 'px' :
        this.state.dragDistance < 0 ?
          ' - ' + Math.abs(this.state.dragDistance) + 'px' :
          '';
    return (
      <div
        className={this.props.classes.root}
        ref={this.onRootRef}
      >
        <Tooltip
          placement="right"
          title={modeNames[this.props.mode]}
        >
          <div
            children={this.intensity}
            className={this.props.classes.blip}
            onMouseDown={this.onMouseDown}
            ref={this.onBlipRef}
            style={{
              backgroundPosition: this.props.mode * -2 + 'em 0',
              top: 'calc(' + percent + '% - ' + ems + 'em' + px + ')'
            }}
          />
        </Tooltip>
      </div>
    );
  }
}

export default withStyles((theme) => ({
  root: {
    display: 'flex',
    flexGrow: 1,
    maxWidth: '2em',
    minWidth: '2em',
    position: 'relative'
  },
  blip: {
    alignItems: 'center',
    backgroundColor: theme.palette.secondary.light,
    backgroundImage: 'url("' + modeImages + '")',
    backgroundSize: 'auto 100%',
    borderRadius: '1em',
    color: theme.palette.common.black,
    cursor: 'pointer',
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'center',
    maxHeight: '2em',
    minHeight: '2em',
    position: 'absolute',
    userSelect: 'none',
    width: '100%',
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
      borderColor: theme.palette.secondary.light,
      fontWeight: 'bold'
    }
  }
}))(Blip);
