class App {
  constructor() {
    this.tabContainer = document.querySelector('.js-tabs');
    this.fileInputs = Array.from(document.querySelectorAll('.js-file'));
    this.submitButtons = Array.from(document.querySelectorAll('.js-submit'));

    this._showTab = this._showTab.bind(this);
    this._submit = this._submit.bind(this);
    this._handleFileInput = this._handleFileInput.bind(this);

    this._showTab(this.tabContainer.querySelector('.tab-item--selected'));
    this._addEventListeners();
  }

  _addEventListeners() {
    
    this.tabContainer.addEventListener('click',this._showTab);

    this.fileInputs.forEach(input => {
      let label  = input.nextElementSibling;
      input.addEventListener('change',this._handleFileInput);
    });

    this.submitButtons.forEach(button => {
      const target = button.dataset.target;
      button.addEventListener('click',this._submit);
    
    });

  }

  _showTab(evt) {
    const target = evt.target || evt;
    if(target.nodeName !== 'LI') {
      return ;
    }

    const tabList = Array.from(this.tabContainer.querySelectorAll('.js-tab-item'));
    tabList.map(node => {
      if(node !== target)
        node.classList.remove('tab-item--selected');
      else if(!node.classList.contains('tab-item--selected')) {
        node.classList.add('tab-item--selected');
      }
    });

    target.classList.add('tab-item--selected');
    
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

    const __getData = function(target) {
      const input = document.querySelector(`#${target}`);
      let values, formData = new FormData();

      formData.append('type', target);

      if(target !== 'urls') {
        values = input.files;
      } else {
        values = input.value.split(";");
      }

      for(const iter of values) {
          formData.append('data', iter);
      }
      return formData;
    }
    
    const type = node.dataset.target;
    fetch(`/submit/${type}`,{
      method:'POST',
      body: __getData(type)
    })
    .then(response => {
      return response.json();
    })
    .then(result => {
      window.open(result.target);
      location.reload();
    })
    .catch(err => console.log(JSON.stringify(err)))
  }
}

new App();