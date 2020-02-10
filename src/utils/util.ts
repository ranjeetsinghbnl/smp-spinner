/**
 * Defining the custom helper functions
 */


/*
* @name isEdge
* @description Whether the current browser is Microsoft Edge.
* @return boolean
*/
const isEdge = () => {
  return /(edge)/i.test(navigator.userAgent)
}

/*
* @name isTrident
* @description Whether the current rendering engine is Microsoft Trident.
* @return boolean
*/
const isTrident = () => {
  return /(msie|trident)/i.test(navigator.userAgent)
}

export {
  isEdge,
  isTrident
}
