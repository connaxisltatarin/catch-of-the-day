import React from 'react';
import AddFishForm from './AddFishForm';
import base from '../base';

class Inventory extends React.Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.authHandler = this.authHandler.bind(this);
    this.loginEmailPassword = this.loginEmailPassword.bind(this);
    this.logout = this.logout.bind(this);
    this.renderLogin = this.renderLogin.bind(this);
    this.renderInventory = this.renderInventory.bind(this);

    this.state = {
      uid: null,
      owner: null
    }
  }

  componentDidMount() {
    base.onAuth((user) => {
      if(user) {
        this.authHandler(null, {user});
      }
    })
  }

  logout() {
    base.unauth();
    this.setState({uid: null});
  }

  handleChange(e, key) {
    const fish = this.props.fishes[key];
    // take a copy of that fish and update it with the new data
    const updatedFish = {
      ...fish,
      [e.target.name]: e.target.value
    }
    this.props.updateFish(key, updatedFish);
  }

  authenticate(provider) {
    base.authWithOAuthPopup(provider, this.authHandler);
  }

  loginEmailPassword(e) {
    e.preventDefault();
    base.authWithPassword({email: this.email.value, password: this.password.value}, this.authHandler);
  }  

  authHandler(err, authData) {
    if(err){
      alert(err.message);
      return;
    }

    const storeRef = base.database().ref(this.props.storeId);
    const uid = authData.uid || authData.user.uid;

    storeRef.once('value', (snapshot) => {
      const data = snapshot.val() || {};

      if(!data.owner){
        storeRef.set({owner: uid});
      }

      this.setState({
        uid: uid,
        owner: data.owner || uid
      })
    });
  }

  renderLogin() {
    return (
      <nav className="login">
        <h2>Inventory ({this.props.storeId})</h2>
        <p>Sign in to manage your store's inventory</p>
        <form className="login-form" ref={(form => {this.loginForm = form})} onSubmit={(e) => this.loginEmailPassword(e)}>
          <label>Email</label> <input ref={(input) => {this.email = input}} type="text"/>
          <label>Password</label> <input ref={(input) => this.password = input} type="password"/>
          <button className="github">Login</button>
        </form>
        <br/>
        <button className="facebook" onClick={() => this.authenticate('facebook')}>Log in with Facebook</button>
      </nav>
    )
  }   

  renderInventory(key) {
    const fish = this.props.fishes[key];
    return (
      <div className="fish-edit" key={key}>
        <input type="text" name="name" value={fish.name} placeholder="Fish Name" onChange={(e) => this.handleChange(e, key)} />
        <input type="text" name="price" value={fish.price} placeholder="Fish Price"  onChange={(e) => this.handleChange(e, key)}/>

        <select type="text" name="status" value={fish.status} placeholder="Fish Status" onChange={(e) => this.handleChange(e, key)}>
          <option value="available">Fresh!</option>
          <option value="unavailable">Sold Out!</option>
        </select>

        <textarea type="text" name="desc" value={fish.desc} placeholder="Fish Desc" onChange={(e) => this.handleChange(e, key)}></textarea>
        <input type="text" name="image" value={fish.image} placeholder="Fish Image" onChange={(e) => this.handleChange(e, key)}/>
        <button onClick={() => this.props.removeFish(key)}>Remove Fish</button>
      </div>
    )
  }

  render() {
    const logout = <button onClick={() => this.logout()}>Log Out!</button>
    if(!this.state.uid){
      return <div>{this.renderLogin()}</div>
    }

    if(this.state.uid !== this.state.owner){
      return <div><p>Sorry, you aren't the owner of this store!</p>{logout}</div>
    }

    return (
      <div>
        <h2>Inventory ({this.props.storeId})</h2>
        {logout}
        {Object.keys(this.props.fishes).map(this.renderInventory)}
        <AddFishForm addFish={this.props.addFish}/>
        <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
      </div>
    )
  } 
}

Inventory.propTypes = {
  fishes: React.PropTypes.object.isRequired,
  updateFish: React.PropTypes.func.isRequired,
  removeFish: React.PropTypes.func.isRequired,
  addFish: React.PropTypes.func.isRequired,
  loadSamples: React.PropTypes.func.isRequired
};

export default Inventory;
