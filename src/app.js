import AppBar from 'material-ui/AppBar';
import CssBaseline from 'material-ui/CssBaseline';
import Icon from 'material-ui/Icon';
import IconButton from 'material-ui/IconButton';
import { createMuiTheme, MuiThemeProvider, withStyles } from 'material-ui/styles';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import React from 'react';
import './app.css';
import Blips from './blips';
import sortBlips from './constants/sort-blips';

const modes = [ 3, 5, 7, 6, 8, 15, 14, 19 ];

const theme = createMuiTheme({
  palette: {
    type: 'dark'
  }
});

class App extends React.PureComponent {

  constructor(props) {
    super(props);
    this.onBlipsChange = this.onBlipsChange.bind(this);
    this.onFileDownload = this.onFileDownload.bind(this);
    this.onFileUpload = this.onFileUpload.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onVideoClick = this.onVideoClick.bind(this);
    this.onVideoRef = this.onVideoRef.bind(this);
    this.onVideoTimeUpdate = this.onVideoTimeUpdate.bind(this);
    this.paused = this.paused.bind(this);
    this.state = {
      blips: [
        [ 0, 0, 0, 0 ]
      ],
      name: 'vibe-story',
      source: null,
      time: 0
    };
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  get duration() {
    if (this.videoRef) {
      const minutes = Math.floor(this.videoRef.duration / 60);
      const seconds = Math.floor(this.videoRef.duration % 60);
      return minutes + ':' + seconds;
    }
    return '0:00';
  }

  get fileDownloadHref() {
    return (
      'data:text/plain;charset=utf-8,' +
      encodeURIComponent(
        this.state.blips
          .reduce(
            (accumulator, [ timestamp, mode, inner, outer ]) =>
              accumulator + timestamp + ' ' + modes[mode] + ' ' + inner + ' ' + outer + '\n',
            ''
          )
      )
    );
  }

  onBlipsChange(blips) {
    this.setState({ blips });
  }

  onFileDownload(e) {
    e.preventDefault();
    const a = document.createElement('a');
    a.setAttribute('href', this.fileDownloadHref);
    a.setAttribute('download', this.state.name + '.csvs');
    a.click();
    return false;
  }

  onFileUpload(e) {
    const file = e.target.files[e.target.files.length - 1];
    const [ name, ext ] = file.name.split(/\./);
    const fileReader = new FileReader();
    if (ext === 'csvs') {
      fileReader.onload = () => {
        const blips = fileReader.result.split(/\n/);

        // Strip the empty line at end of flie.
        blips.pop();
        this.setState({
          blips:
            blips
              .map((line) =>
                line.split(/\s+/)
                  .map((i) => parseInt(i, 10))
              )
              .map((blip) => {
                blip[1] = modes.indexOf(blip[1]);
                return blip;
              })
              .sort(sortBlips)
        });
      };
      fileReader.readAsText(file);
    }
    else {
      fileReader.onload = () => {
        this.setState({
          name,
          source: URL.createObjectURL(
            new Blob([ fileReader.result ]),
            { type: file.type }
          )
        });
      };
      fileReader.readAsArrayBuffer(file);
    }
  }

  onKeyDown(e) {
    e.preventDefault();
    if (this.videoRef === null) {
      return false;
    }
    const DOWN = 40;
    const LEFT = 37;
    const RIGHT = 39;
    const SPACE = 32;
    const UP = 38;
    if (e.keyCode === DOWN) {
      this.videoRef.playbackRate = Math.max(this.videoRef.playbackRate - 0.05, 0.1);
    }
    else if (e.keyCode === LEFT) {
      this.videoRef.currentTime = this.videoRef.currentTime - 0.5;
    }
    else if (e.keyCode === RIGHT) {
      this.videoRef.currentTime = this.videoRef.currentTime + 0.5;
    }
    else if (e.keyCode === SPACE) {
      if (this.videoRef.paused) {
        this.videoRef.play();
      }
      else {
        this.videoRef.pause();
      }
    }
    else if (e.keyCode === UP) {
      this.videoRef.playbackRate = Math.min(this.videoRef.playbackRate + 0.05, 10);
    }
    return false;
  }

  onVideoClick() {
    if (this.videoRef.paused) {
      this.videoRef.play();
    }
    else {
      this.videoRef.pause();
    }
  }

  onVideoRef(videoRef) {
    this.videoRef = videoRef;
    if (videoRef) {
      videoRef.playbackRate = 0.25;
    }
  }

  onVideoTimeUpdate() {
    if (this.state.time !== this.videoRef.currentTime) {
      this.setState({
        time: this.videoRef.currentTime
      });
    }
  }

  paused() {
    return this.videoRef.paused;
  }

  get time() {
    const minutes = Math.floor(this.state.time / 60);
    const seconds = Math.floor(this.state.time % 60);
    const ms = Math.floor((this.state.time % 1) * 10);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds + '.' + (ms < 10 ? '0' : '') + ms;
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static">
          <Toolbar>
            <Typography
              children="Vibe Story Editor"
              className={this.props.classes.title}
              color="inherit"
              variant="title"
            />
            <IconButton
              color="inherit"
              component="label"
            >
              <Icon children="file_upload" />
              <input
                className={this.props.classes.hidden}
                onChange={this.onFileUpload}
                type="file"
              />
            </IconButton>
            <IconButton
              color="inherit"
              component="a"
              download="vibe-story.csvs"
              onClick={this.onFileDownload}
            >
              <Icon children="file_download" />
            </IconButton>
          </Toolbar>
        </AppBar>
        <main className={this.props.classes.main}>
          <div className={this.props.classes.watch}>
            {
              this.state.source ?
                <video
                  autoPlay
                  className={this.props.classes.video}
                  controls
                  loop
                  onClick={this.onVideoClick}
                  ref={this.onVideoRef}
                  onTimeUpdate={this.onVideoTimeUpdate}
                >
                  <source
                    src={this.state.source}
                    type="video/mp4"
                  />
                </video> :
                null
            }
            <Typography
              children={this.time + ' / ' + this.duration}
              className={this.props.classes.time}
              variant="headline"
            />
          </div>
          {
            this.videoRef ?
              <Blips
                blips={this.state.blips}
                currentTime={Math.round(this.state.time * 1000)}
                duration={this.videoRef.duration * 1000}
                onChange={this.onBlipsChange}
                paused={this.paused}
              /> :
              null
          }
        </main>
      </MuiThemeProvider>
    );
  }
}

export default withStyles((theme) => ({
  hidden: {
    display:'none'
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1
  },
  time: {
    backgroundColor: '#404040',
    borderRadius: '0 0 1em 0',
    lineHeight: '2em',
    paddingLeft: '0.5em',
    paddingRight: '0.75em',
    position: 'absolute'
  },
  title: {
    flexGrow: 1
  },
  video: {
    flexGrow: 1,
    maxWidth: '100%'
  },
  watch: {
    display: 'flex',
    flexGrow: 1,
    maxHeight: '50vh',
    maxWidth: '100%',
    minHeight: '50vh',
    position: 'relative'
  }
}))(App);
