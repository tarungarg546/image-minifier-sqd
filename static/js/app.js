class App {
  constructor() {
    
    //init variable
    this.tabContainer = document.querySelector('.js-tabs');
    this.fileInputs = Array.from(document.querySelectorAll('.js-file'));
    this.submitButtons = Array.from(document.querySelectorAll('.js-submit'));

    //Bind functions with 'this'
    this._showTab = this._showTab.bind(this);
    this._submit = this._submit.bind(this);
    this._handleFileInput = this._handleFileInput.bind(this);
    this._dirtyChecking = this._dirtyChecking.bind(this);

    //Run these functions on init
    this._showTab(this.tabContainer.querySelector('.tab-item--selected'));
    this._addEventListeners();
  }

  _addEventListeners() {
    
    //Show a tab and hide other when there is click on child of tabContainer
    this.tabContainer.addEventListener('click',this._showTab);

    //Attach event hadler for file inputs to show customized messages
    this.fileInputs.forEach(input => {
      let label  = input.nextElementSibling;
      input.addEventListener('change',this._handleFileInput);
    });

    //After clickin on submit submit the form
    this.submitButtons.forEach(button => {
      const target = button.dataset.target;
      button.addEventListener('click',this._submit);
    
    });

  }

  _showTab(evt) {
    //If child or portion clicked is not tab then return
    const target = evt.target || evt;
    if(target.nodeName !== 'LI') {
      return ;
    }

    const tabList = Array.from(this.tabContainer.querySelectorAll('.js-tab-item'));
    //Show current clicked tab and hide others
    tabList.map(node => {
      if(node !== target)
        node.classList.remove('tab-item--selected');
      else if(!node.classList.contains('tab-item--selected')) {
        node.classList.add('tab-item--selected');
      }
    });

    target.classList.add('tab-item--selected');
    
    //Show content of current tab and hide content of others
    const __showContent = function(target) {
      const contentList = Array.from(document.querySelectorAll('.tab-content'));
      contentList.map(node => {
        if(node !== target) {
          node.classList.remove('tab-content--show');
        } else if(!node.classList.contains('tab-content--show')){
          node.classList.add('tab-content--show');
        }
      });

    }

    const targetContent = document.querySelector(`.${target.dataset.content}`);

    return __showContent(targetContent); // show content of corresponding tab
  }

  _handleFileInput(evt) {
    const input = evt.target,
          label = input.nextElementSibling;
    let fileName = '';

    if(input.files && input.files.length > 1) {
      fileName = (input.getAttribute('data-multiple-caption') || '').replace('{count}', input.files.length);
    } else {
      fileName = input.value.split( '\\' ).pop();
    }

    if(fileName) {
      label.querySelector('span').innerHTML = fileName;
    }
  }

  _submit(evt) {
    const node = evt.target;
    if(node.nodeName !== 'BUTTON') 
      return ;

    const type = node.dataset.target;
    
    if(this._dirtyChecking(type)) {
      this._showToast();
      return ;
    }

    //Get form data that should be sent to server
    const __getData = function(target) {
      const input = document.querySelector(`#${target}`);
      let values, formData = new FormData();

      formData.append('type', target);

      if(target !== 'urls') {
        //if its part of file input
        values = input.files;
      } else {
        values = input.value.split(";");
      }

      for(const iter of values) {
          formData.append('data', iter);
      }
      return formData;
    }
    
    //submit post
    fetch(`/submit/${type}`,{
      method:'POST',
      body: __getData(type)
    })
    .then(response => {
      if(!response || response.status !== 200 ||response.type !==  'basic') {
        throw new Error("Please supply valid inputs.");
      }
      return response.json();
    })
    .then(result => {
      window.open(result.target);
      location.reload();
    })
    .catch(error => {
      this._showToast(error);
      console.log(error);
    });

  }

  //Dirty check if input supplied is valid or not
  _dirtyChecking(type) {
    if(type === 'urls') {
      return false;
    } else {
      const target = document.querySelector(`#${type}`);

      if(type === 'csv') {
        if(!target.files[0].name.slice(-4) !== '.csv') {
          //it's not a csv
          return true;
        }
      } else {
        const files = Array.from(target.files);
        const flag = files.every(file => file.name.match(/\.(jpg|jpeg|png|gif|svg)$/));

        if(flag) {
          //correct
          return false;
        } 
        return true;
      }
    }
    return true;
  }

  //Show toast in case of invalid input or error
  _showToast(msg) {

    const toast = document.createElement('button');
    toast.textContent = msg || 'Please give valid inputs.';
    toast.classList.add('toast');
    
    setTimeout(function() {
      document.body.removeChild(toast);
    },2000);

    document.body.append(toast);
  }
}

new App();