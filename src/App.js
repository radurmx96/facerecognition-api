import React, {Component} from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import './App.css';

/*this const is used for the particles background generator
the data was chosen with the help of the real-time change viewer from the
librarie's website*/
const particleOptions = {
   particles: {
    number: {
      value: 152,
      density: {
        enable: true,
        value_area: 940
      }
    },
    move: {
      enable: true,
      speed: 4,
      random: false,
      straight: false,
      out_mode: 'bounce',
      rotateX: 600,
      rotateY: 1200
    }
  },

  interactivity: {
    onhover: {
      enable: true,
      mode: 'grab'
    },
    onclick: {
      enable: true,
      mode: 'repulse'
    },
    modes: {
      detect_on: 'canvas'
    }
  }
}

const initialState = {
   input: '',
      imageUrl: '',
      box: {}, /*this box will contain the values that we receive for the face detection
      from the bounding box*/
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
     
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
      fetch('https://ancient-sands-30879.herokuapp.com/imageurl', {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            input: this.state.input
          })
      })
      .then(response => response.json()) 
      .then(response => {
        if (response) {
          fetch('https://ancient-sands-30879.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
            })
            .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }
  
  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state; /*we are using this too much so we
    can destructure to use them without "this.state"*/

    return (
      <div className="App">
        <Particles 
          className="particles"
          params={particleOptions}
        />
        <Navigation 
          isSignedIn={isSignedIn} 
          onRouteChange={this.onRouteChange}
        /> {/*for the sign out*/}
        { route === 'home' 
            ? <div>
                <Logo /> {/*logo*/}
                <Rank 
                  name={this.state.user.name} 
                  entries={this.state.user.entries}
                /> {/*this rank component will give us our username and the rank 
                      compared with all the other users that have submitted pictures*/}
                <ImageLinkForm 
                  onInputChange={this.onInputChange} 
                  onButtonSubmit={this.onButtonSubmit} 
                /> {/*input form*/}
                <FaceRecognition 
                  box={box}
                  imageUrl={imageUrl}
                /> {/*image with the face recognition on it*/ }
              </div>
            : (
                route === 'signIn'
                  ? <SignIn 
                      loadUser={this.loadUser}
                      onRouteChange={this.onRouteChange}
                    /> /*for the SignIn*/ 
                  : <Register 
                      loadUser={this.loadUser} 
                      onRouteChange={this.onRouteChange}
                    /> /*for the Register form*/ 
              )    
        }
      </div>
    );
  };
}

export default App;
