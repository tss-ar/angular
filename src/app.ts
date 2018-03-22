import * as angular from 'angular';

import * as directives from './directives';
import * as components from './components';
import { tssHighlight } from './filters/tssHighlight';
import * as servicies from './servicies';
import './templates';

angular
  .module('TSS.AngularJs', [
    'ui.bootstrap.dateparser',
    'ui.bootstrap.position',
    'tss-angular.templates'
  ])
  .directive('datepickerPopup', directives.datepickerPopup)
  .directive('datetimepicker', directives.datetimepicker)
  .directive('draggable', directives.draggable)
  .directive('feedback', components.feedback)
  .directive('fileModel', directives.fileModel)
  .directive('focusMe', directives.focusMe)
  .directive('ngEnter', directives.ngEnter)
  .directive('preview', directives.preview)
  .directive('pxStyle', directives.pxStyle)
  .directive('rcDisabled', directives.rcDisabled)
  .directive('removeHref', directives.removeHref)
  .directive('sort', components.sort)
  .directive('webcam', directives.webcam)
  .provider('rcDisabled', servicies.RcDisabledProvider)
  .service('alertService', servicies.AlertService)
  .filter('tssHighlight', tssHighlight);
