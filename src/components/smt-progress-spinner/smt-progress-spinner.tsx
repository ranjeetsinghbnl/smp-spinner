/*
 * @component SmtProgressSpinner
 * @description
 * This component is used for circular indicators of progress and activity
 * It supports two modes, "determinate" and "indeterminate".
 * Inspired from angular material progress spinner
 * @Prop
 * color: {string} default:#3f51b5 hex code
 * diameter: {number} default:100 The diameter of the progress spinner (will set width and height of svg).
 * mode: {string} default:determinate
 * -determinate: Standard progress indicator, fills from 0% to 100%
 * -indeterminate: Indicates that something is happening without conveying a discrete progress
 * strokeWidth: {number} default:10 Stroke width of the progress spinner.
 * value: {number} default:10 Value of the progress circle.
 */

import { Component, h, Watch, Prop, Element } from '@stencil/core';

import {
  BASE_SIZE,
  P_SPINNER_MODE,
  BASE_STROKE_WIDTH,
  INDETERMINATE_ANIMATION_TEMPLATE,
  checkNumber
} from "../../utils/config";

import {
  isTrident,
  isEdge
} from "../../utils/util";

@Component({
  tag: 'smt-progress-spinner',
  styleUrl: 'smt-progress-spinner.scss'
})
export class SmtProgressSpinner {

  @Prop() color: string = '#3f51b5';
  @Watch('color')
  vaWatchColor() {
    this.addAnimation()
  }

  @Prop() diameter: number = BASE_SIZE;
  @Watch('diameter')
  validateDiameter(newValue: number) {
    if (!checkNumber(newValue)) { throw new Error('Invalid diameter value.') };
    this.addAnimation()
  }

  @Prop() mode: string = 'determinate';
  @Watch('mode')
  validateMode(newValue: string) {
    if (!P_SPINNER_MODE[newValue]) { throw new Error('Invalid mode.') }
    this.toggleContainerClass();
    this.addAnimation();
  }

  @Prop() strokeWidth: number = 10;
  @Watch('strokeWidth')
  validateStrokeWidth(newValue: number) {
    if (!checkNumber(newValue)) { throw new Error('Invalid stroke width.') };
    this.addAnimation();
  }

  @Prop({ mutable: true }) value: number = 10;
  @Watch('value')
  validateValue(newValue: number) {
    if (!checkNumber(newValue)) { throw new Error('Invalid progress value.') };
    this.value = Math.max(0, Math.min(100, newValue));
    this.addAnimation();
  }

  // Element reference
  @Element() el: HTMLElement;

  /*
  * @name componentWillLoad
  * @description Initializing animation classes and inject to DOM, element
  * @return number
  */
  componentWillLoad() {
    this.toggleContainerClass();
    this.addAnimation();
  }

  /*
  * @name addAnimation
  * @description Add/Update animation class of svg
  * @return none
  */
  addAnimation = () => {
    const ID = "smt-progress-spinner-animation"
    if (document.getElementById(ID)) {
      document.getElementById(ID).textContent = this.getAnimationText();
    } else {
      const styleTag: HTMLStyleElement = document.createElement('style');
      styleTag.id = ID;
      styleTag.textContent = this.getAnimationText();
      document.head.appendChild(styleTag);
    }
  }

  /*
  * @name getSvgStyle
  * @description Generates svg height,width.
  * @return Object<key:string>
  */
  getSvgStyle = () => {
    return {
      'width': `${this.diameter}px`,
      'height': `${this.diameter}px`
    }
    // return `width:${this.diameter}px;height:${this.diameter}px`
  }

  /*
  * @name getCircleStyle
  * @description Generates circle inline style.
  * @return Object<key:string>
  */
  getCircleStyle = () => {
    return {
      'animation-name': this.mode == 'indeterminate' ? `smt-progress-spinner-stroke-rotate-${this.diameter}` : '',
      'stroke-dashoffset': `${this.strokeDashOffset()}px`,
      'stroke-dasharray': `${this.strokeCircumference()}px`,
      'stroke-width': `${this.circleStrokeWidth()}%`
    }
  }


  /*
  * @name circleRadius
  * @description The radius of the spinner, adjusted for stroke width.
  * @return number
  */
  circleRadius(): number {
    return (this.diameter - BASE_STROKE_WIDTH) / 2;
  }

  /*
  * @name circleStrokeWidth
  * @description Stroke width of the circle in percent.
  * @return {number}
  */
  circleStrokeWidth(): number {
    return this.strokeWidth / this.diameter * 100;
  }

  /*
  * @name strokeCircumference
  * @description The stroke circumference of the svg circle.
  * @return number
  */
  strokeCircumference(): number {
    return 2 * Math.PI * this.circleRadius();
  }

  /*
  * @name strokeDashOffset
  * @description The dash offset of the svg circle.
  * @return {number} | {null}
  */
  strokeDashOffset(): number | null {
    if (this.mode === 'determinate') {
      return this.strokeCircumference() * (100 - this.value) / 100;
    }
    // In fallback mode set the circle to 80% and rotate it with CSS.
    if (this.fallbackAnimation && this.mode === 'indeterminate') {
      return this.strokeCircumference() * 0.2;
    }
    return null;
  }


  /*
  * @name toggleContainerClass
  * @description add/remove animation class to element
  * @return none
  */
  toggleContainerClass = () => {
    if (this.mode == 'indeterminate') {
      let cc: Array<string> = [`smt-mode-${this.mode}${this.fallbackAnimation ? '-fallback' : ''}`];
      this.el.classList.add(...cc);
    } else {
      let cc: Array<string> = [`smt-mode-indeterminate${this.fallbackAnimation ? '-fallback' : ''}`];
      this.el.classList.remove(...cc)
    }
  }

  /*
  * @name viewBox
  * @description The view box of the spinner's svg element.
  * @return string
  */
  viewBox(): string {
    let r = this.circleRadius()
    const viewBox = r * 2 + this.strokeWidth;
    return `0 0 ${viewBox} ${viewBox}`;
  }

  /*
  * @name getAnimationText
  * @scope private
  * @description Generates animation styles adjusted for the spinner's diameter.
  * @return none
  */
  getAnimationText = (): string => {
    return INDETERMINATE_ANIMATION_TEMPLATE
      // Animation should begin at 5% and end at 80%
      .replace(/START_VALUE/g, `${0.95 * this.strokeCircumference()}px`)
      .replace(/END_VALUE/g, `${0.2 * this.strokeCircumference()}px`)
      .replace(/DIAMETER/g, `${this.diameter}`);
  }

  // Detecting browser is IE/Edge for setting fallback animation
  fallbackAnimation = isEdge() || isTrident();

  render() {
    return (
      <svg
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
        viewBox={this.viewBox()}
        style={this.getSvgStyle()}
      >
        <circle
          cx="50%"
          cy="50%"
          r={this.circleRadius()}
          style={this.getCircleStyle()}
          stroke={this.color}
        ></circle>
      </svg>
    );
  }
}
