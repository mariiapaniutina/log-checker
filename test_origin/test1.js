/**
 * This is file for testing Ember component and its methods....
 * FILE :: test1.js
 */
import Ember from 'ember';

export default Ember.Component.extend({
  /**
   * Some service here
   */
  someService: Ember.inject.service('someService'),

  /**
   * Some test object here
   */
  someObject: {
    isHere: true,
    content: ''
  },

  /**
   * Ember.computed without function
   */
  emComNoFn: Ember.computed.or('someObj', 'someObj1'),

  /**
   * Ember.computed with callback
   */
  emComFn: Ember.computed('someObj', 'someObj1', function () {
    return this.get('someObj1')  + this.get('someObj');
  }),

  /**
   * Ember computed reads
   */
  emComRdNoFn: Ember.computed.reads('someObj2'),

  /**
   * Ember computed with values in different lines
   */
  emComFnLines: Ember.computed('obj1',
    'obj2',
    function(){
    return this.get('obj1') + this.get('obj2');
  }),

  /**
   * Checking if statement
   */
  checkIf: Ember.computed('obj1', function(){
    const m = 1;
    if (m > this.get('obj1') || m < 32){
      return 'bigger';
    }
    return 'smaller'
  }),

  /**
   * Checking switch statement
   */
  checkSwitch: Ember.computed('obj1', function(){
    const m = this.get('obj1');
    let res = '';

    switch (m) {
      case 'one':
        res =  'oneeeee';
        break;
      case 'two':
        res = 'twoooo';
        break;
      default:
        res = 'idontknow';
        break;
    }
  }),

  /**
   * Checking while statement
   */
  checkWhile: Ember.computed('obj1', function(){
    const m = 1;
    let arr = [];
    while (m < this.get('obj1')){
      arr.push(m * this.get('obj1'));
    }
    return arr;
  }),

  checkFn: Ember.computed('obj1', function(){
    const fn = function(){
      return 'first :: fn';
    };

    let fn1 = function(){
      return 'second :: fn1';
    };

    const fn2 = () => {
      return 'third :: fn2';
    };

    let fn3 = () => {
      return 'fourth :: fn3';
    };

    const fn4 = ({ob1, ob2}) => {
      return 'fifth :: fn4';
    };

    const fn5 = ({ob1 = 1, ob2}) => {
      return 'sixth :: fn5';
    };
  }),

  actions: {
    /**
     * Changing some state
     * @param state
     */
    changeState(state){
      this.set('state', state);
    }
  }
});