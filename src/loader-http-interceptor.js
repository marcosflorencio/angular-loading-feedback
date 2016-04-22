/**
* Basic loading for requisitions in angulars apps
* in construction :)
* Thanks for the loading css @brunjo - http://codepen.io/brunjo/pen/vELmaP   
*/
(function(){
'use strict';
  angular
  .module('angular-loading-feedback',[])
  .directive('loadingFeedback', loadingFeedback)
  .config(config);

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
        $rootScope.$broadcast('OpenLoadindEvent');
      };
      
      function closeLoading(urlConfig){
        var index = requestList.indexOf(urlConfig);
        requestList.splice(index, 1);
        if (requestList.length == 0) 
          $rootScope.$broadcast('CloseLoadingEvent');
      };
    };
    
    $httpProvider.interceptors.push('LoadindFeedBackInterceptor');
  };
  
  loadingFeedback.$inject = ['$rootScope'];
  function loadingFeedback($rootScope){
    var directive = {
      restrict: 'E',
      scope:{
        loadingMessage: '@',
      },
      template:
       '  <div data-ng-if="ativeLoading" class="angular-loadind-feedback-modal">'
       +   '<h3 class="angular-loadind-feedback-text">'
       +   '  <b>{{loadingMessage}}<i class="angular-loadind-feedback-signal"></i></b>'
       +   '</h3>'
       +  '</div>',
      link: link
    };
    return directive;
    
    function link(scope, element, attrs) {
      scope.ativeLoading = false;
      $rootScope.$on('OpenLoadindEvent', showThis);
      $rootScope.$on('CloseLoadingEvent', hideThis);
      
      function showThis(){
        scope.ativeLoading = true;
      };
      
      function hideThis(){
        scope.ativeLoading = false;
      };
    };
  };
}());

