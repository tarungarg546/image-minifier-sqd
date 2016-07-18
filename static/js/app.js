class App {
  constructor() {
    this.tabContainer = document.querySelector('.tab-list');
    this.fileInputs = Array.from(document.querySelectorAll('.inputFile'));

    this.cleanActiveTabs = this.cleanActiveTabs.bind(this);
    this.showTab = this.showTab.bind(this);
    this.showContent = this.showContent.bind(this);

    this.showTab(this.tabContainer.querySelector('.active'))
    this.addEventListeners();
  }

  addEventListeners() {
    //Use event bubbling because attaching event handler to one DOM element is cheaper than
    //to attach it on multiples __ tradeoff :- memory usage
    this.tabContainer.addEventListener('click',ev => {
      const target = ev.target;

      if(target.nodeName === 'LI') {
        this.showTab(target);
        target.classList.add('active');
      }
    });

    this.fileInputs.forEach(input => {
      let label  = input.nextElementSibling;

      input.addEventListener('change',e => {
        let fileName = '';
        if(input.files && input.files.length > 1) {
          fileName = (input.getAttribute('data-multiple-caption') || '').replace('{count}', input.files.length);
        } else {
          fileName = e.target.value.split( '\\' ).pop();
        }

        if(fileName) {
          label.querySelector('span').innerHTML = fileName;
        }
      });

    });

  }

  /**
   * [showTab Show content of target tab and clean other active tabs]
   * @param  {[HTMLElement]} target
   * @return {[type]}        [description]
   */
  showTab(target) {
    this.cleanActiveTabs(); // clean other active tabs
    
    if(!target.classList.contains('active')) {
      target.classList.add('active'); // make this tab active
    }
    const targetContent = document.querySelector(`.${target.dataset.content}`)

    return this.showContent(targetContent); // show content of corresponding tab

  }

  cleanActiveTabs() {
    const tabList = Array.from(this.tabContainer.querySelectorAll('li'));

    tabList.map(node => {
      node.classList.remove('active');
    })
  }

  showContent(target) {
    const contentList = Array.from(document.querySelectorAll('.tab-content'));

    contentList.map(node => {
      if(node !== target) {
        node.classList.remove('show');
      } else {
        node.classList.add('show');
      }
    })
  }
}

new App();