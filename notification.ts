/**
 * Created by AaronYuan on 4/16/15.
 */
/// <reference path="plugins.ts" />
module missfresh {
    'use strict';

    class notification {

        public dialog:Dialog;

        constructor (){
            this.dialog = new Dialog();
        }

        alert(message, callback) {
            this.dialog.createOverlayer();
            this.dialog.createDialog({
                message:message,
                cancelCallback: callback
            });
        }

        confirm(message, callback) {
            var arg = Array.prototype.slice.call(arguments);
            if(arg.length>2){
                this.prompt(arg[0],arg[1],arg[2],arg[3]);
                return null;
            }
            this.dialog.createOverlayer();
            this.dialog.createDialog({
                message:message,
                callback: callback,
                type:'confirm'
            });
        }

        prompt(message, callback, title, buttonLabels, defaultText = '') {
            this.dialog.createOverlayer();
            this.dialog.createDialog({
                type: 'list',
                message: message,
                callback:callback,
                title: title,
                buttonLabels: buttonLabels
            });
        }

        beep(times) {

        }
    }

    interface IWrapElement {
        wrap: HTMLElement;
        title: HTMLElement;
        message: HTMLElement;
        buttons: HTMLElement[];
        buttonWrap:HTMLElement;
    }

    class Dialog {
        public overLayer:any;
        public dialogWrap:any;
        public elements:IWrapElement;
        constructor() {
            this.elements = {
                wrap:null,
                title:null,
                message:null,
                buttons:null,
                buttonWrap:null
            };
        }
        /*
         <div class="notification-wrap">
         <div class="notification popup">
         <div class="popup-head">
         <h3 class="popup-title">Don't eat that!</h3>
         </div>
         <div class="notify-content popup-body">
         <span id="notify-message">hello world</span>
         </div>
         <div class="popup-buttons">
         <button class="button button-positive button-default" >OK</button>
         <button class="button button-positive button-default" >Cancel</button>
         </div>
         </div>
         </div>
         */
        createDialog(args) {
            if(!this.elements.wrap){
                this.elements.wrap = document.createElement('div');
                this.elements.wrap.classList.add('notification-wrap');
                this.elements.wrap.classList.add('active');
                var d =  document.createElement('div');
                d.classList.add('notification');
                d.classList.add('popup');

                var title = document.createElement('div');
                title.classList.add('popup-head');
                this.elements.title = document.createElement('h3');
                this.elements.title.classList.add('popup-title');
                title.appendChild(this.elements.title);

                d.appendChild(title);

                title = document.createElement('div');
                title.classList.add('notify-content');
                title.classList.add('popup-body');
                this.elements.message = document.createElement('span');
                title.appendChild(this.elements.message);

                d.appendChild(title);

                this.elements.buttonWrap= document.createElement('div');
                this.elements.buttonWrap.classList.add('popup-buttons');

                d.appendChild(this.elements.buttonWrap);

                this.elements.wrap.appendChild(d);
                document.body.appendChild(this.elements.wrap);
            }
            this.createButtons(args);

            this.elements.message.innerHTML = args.message;
            this.elements.title.innerHTML = !args['title'] ? '提示': args.title;
            this.elements.wrap.style.top = (window.innerHeight/2 - parseInt(this.elements.wrap.style.height)/2) + 'px';
            //this.elements.wrap.style.display = 'flex';
            this.elements.wrap.style.display = 'block';
        }

        createButtons(arg) {
            this.elements.buttons = [];
            this.elements.buttonWrap.innerHTML = '';
            var self = this;
            if(arg['type'] && arg.type=='confirm'){
                var btn = self.createButtonDom();
                btn.innerHTML = "确定";
                self.bindEvent(btn,'click', function(){
                    self.close();
                    (!!arg.callback) && arg.callback();
                });
                this.elements.buttons.push(btn);
            } else if(arg['type'] && arg.type =='list'){
                for(var i=0;i < arg.buttonLabels.length; i++){
                    (function (index) {
                        var btn = self.createButtonDom(index == 0? true:false);
                        btn.innerHTML = arg.buttonLabels[i];
                        self.bindEvent(btn, 'click', function(){
                            (!!arg.callback) && arg.callback(index+1);
                            self.close();
                        });
                        self.elements.buttons.push(btn);
                    })(i);
                }
            }
            if(!arg['type'] || arg['type']!= 'list') {
                var b = document.createElement('button');
                b.classList.add('button');
                b.classList.add('button-default');
                b.innerHTML = '关闭';

                this.bindEvent(b, 'click', function () {
                    (!!arg.cancelCallback) &&arg.cancelCallback();
                    self.close();
                });
                this.elements.buttons.push(b);
            }

            for(var i =0 ; i < this.elements.buttons.length; i++) {
                self.elements.buttonWrap.appendChild(this.elements.buttons[i]);
            }
            return this.elements.buttons;
        }
        createButtonDom(isCancel:boolean = false) {
            var b = document.createElement('button');
            b.classList.add('button');
            if(!isCancel) {
                b.classList.add('button-positive');
            }
            b.classList.add('button-default');
            return b;
        }

        bindEvent(obj,event,func){
            if(obj.addEventListener){
                obj.addEventListener(event,func,false);
            } else if (obj.attachEvent) {
                obj.attachEvent('on'+event, func);
            }
        }

        //创建遮罩层
        createOverlayer() {
            var self = this;
            if(!this.overLayer) {
                this.overLayer = document.createElement('div');
                this.overLayer.classList.add('notify-over-layer');
                this.overLayer.classList.add('active');
                this.bindEvent(this.overLayer,'click',function(){
                    self.close();
                });

                window.document.body.appendChild(this.overLayer);
            }
            this.overLayer.style.display = 'block';
            return this.overLayer;
        }

        close() {
            this.overLayer.style.display = 'none';
            this.elements.wrap.style.display = 'none';
        }


    }


    pluginManager.register('window.navigator.notification', new notification());
}