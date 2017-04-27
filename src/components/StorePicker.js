import React from 'react';
import base from '../base';
import { getFunName } from '../helpers';

class StorePicker extends React.Component {
  constructor() {
    super();

    this.state = {
      stores: []
    };
  }

  goToStore(event) {
    event.preventDefault();
    console.log('You Changed the URL');
    // first grab the text from the box
    const storeId = this.storeInput.value;
    console.log(`Going to ${storeId}`)
    // second we're going to transition from / to /store/:storeId
    this.context.router.transitionTo(`/store/${storeId}`);
  }

  goToStoreSpan(element) {
    //window.location.href= `/store/${element.target.textContent}`;
    this.context.router.transitionTo(`/store/${element.target.textContent}`);
  }

  componentDidMount() {
    const storeRef = base.database().ref();

    storeRef.once('value', (snapshot) => {
      const data = snapshot.val() || {};
      var stores = [];

      for(var i in data){
          if(data[i]){
            stores.push(i);
          }
      }

      if(stores){
        this.setState({stores});
      }
    });     
  }

  render() {
    const storesHtml = this.state.stores ? <div>{this.state.stores.map((item) => {return <div><span key={item} onClick={(element) => {this.goToStoreSpan(element)}}>{item}</span><br/></div>;})}</div> : null;

    // Any where else
    return (
      <div>
        <form className="store-selector" onSubmit={(e) => this.goToStore(e)}>
          <h2>Please Enter A Store</h2>
          <input type="text" required placeholder="Store Name" defaultValue={getFunName()} ref={(input) => { this.storeInput = input}} />
          <button type="submit">Visit Store →</button>
          <br/><br/>
          <h2>Available stores</h2>
          {storesHtml}
        </form>
      </div>
    )
  }
}

StorePicker.contextTypes = {
  router: React.PropTypes.object
}

export default StorePicker;
