/**
* Basic loading for requisitions in angulars apps
* in construction :)
* Thanks for the loading css @brunjo - http://codepen.io/brunjo/pen/vELmaP   
*/
(function(){
'use strict';
  angular
  .module('angular-loading-feedback', [])
  .directive('loadingFeedback', loadingFeedback)
  .directive('loadingFeedbackIgnore', loadingFeedbackIgnore)
  .factory('loadingFactory', loadingFactory)
  .config(config)
  .run(run);

  run.$inject = ['$templateCache'];
  function run($templateCache){
    $templateCache
      .put('angular-loading-feedback.modal.template.html', 
           '<div data-ng-if="ativeLoading" class="angular-loadind-feedback-modal" data-ng-init="setColorConfig()">'
       +   '<h3 class="angular-loadind-feedback-text">'
       +   '  <b>{{loadingMessage}}<i class="angular-loadind-feedback-signal"></i></b>'
       +   '</h3>'
       +  '</div>');
  };

  config.$inject = ['$provide', '$httpProvider'];
  function config($provide, $httpProvider) {
    $provide.factory('LoadindFeedBackInterceptor', LoadindFeedBackInterceptor);

    LoadindFeedBackInterceptor.$inject = ['$q', '$rootScope'];
    function LoadindFeedBackInterceptor($q, $rootScope) {
      var interceptor = {
        request: onRequest,
        response: onResponse,
        requestError: onRequestError,
        responseError: onResponseError
      },
      requestList = [];
      return interceptor;
      
      function onRequest(config){
        openLoading(config.url);
        return config;
      };
      
      function onResponse(response) {
        closeLoading(response.config.url);
        return response;
      };
      
      function onRequestError(rejection) {
        closeLoading(rejection.config.url);
        return $q.reject(rejection);
      };
      
      function onResponseError(rejection) {
        closeLoading(rejection.config.url);
        return $q.reject(rejection);
      };
      
      function openLoading(urlConfig){
        requestList.push(urlConfig);
        $rootScope.$emit('OpenLoadindEvent');
      };
      
      function closeLoading(urlConfig){
        var index = requestList.indexOf(urlConfig);
        requestList.splice(index, 1);
        if (requestList.length == 0) 
          $rootScope.$emit('CloseLoadingEvent');
      };
    };
    $httpProvider.interceptors.push('LoadindFeedBackInterceptor');
  };
  
  loadingFeedback.$inject = ['$rootScope', 'loadingFactory'];
  function loadingFeedback($rootScope, loadingFactory){
    var directive = {
      restrict: 'E',
      scope:{
        loadingMessage: '@'
          , bgColor: '@'
          , textColor: '@'
      },
      templateUrl: 'angular-loading-feedback.modal.template.html',
      link: link
    };
    
    return directive;
    
    function link(scope, element, attrs) {
      scope.ativeLoading   = false;
      scope.setColorConfig = setColorConfig;
      $rootScope.$on('OpenLoadindEvent', showThis);
      $rootScope.$on('CloseLoadingEvent', hideThis);
      
      function setColorConfig(){
        var modalElement  = getElement('.angular-loadind-feedback-modal')
          , textElement   = getElement('.angular-loadind-feedback-text')
          , signalElement = getElement('.angular-loadind-feedback-signal')

        modalElement.css('background-color', scope.bgColor);
        textElement.css('color', scope.textColor);
        signalElement.css('border', '5px solid ' + scope.textColor);
      };
      
      function getElement(selector){
        return angular.element(document.querySelector(selector));
      };
      
      function showThis(){
        if (!loadingFactory.getLoadingIgnore())
            scope.ativeLoading = true;
      };
      
      function hideThis(){
        scope.ativeLoading = false;
      };
    };
  };

  loadingFeedbackIgnore.$inject = ['loadingFactory']; 
  function loadingFeedbackIgnore(loadingFactory){
    var directive = {
      priority: 1,
      restrict: 'A',
      link: link,
      scope: {}
    };    
    return directive;
    
    function link(scope, element, attrs) {
      element.bind('focus', function(){
        loadingFactory.setLoadingIgnore(true);
      });
      
      element.bind('blur', function(){
        loadingFactory.setLoadingIgnore(false);
      });
    };
  };
  
  function loadingFactory(){
    var factory = {
      setLoadingIgnore : setLoadingIgnore,
      getLoadingIgnore : getLoadingIgnore
    }
    , loadingIgnored = false;
    return factory;
    
    function setLoadingIgnore(status){
      loadingIgnored = status;
    };
    
    function getLoadingIgnore(){
      return loadingIgnored;
    };
  };
}());