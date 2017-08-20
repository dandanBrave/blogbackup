---
layout: post
title: javascript继承的理解
date: 2017-8-20
categories: blog
tags: [总结,知识管理]
description: javascript继承的理解
---
>js的继承有6种方式，大致总结一下它们各自的优缺点，以及它们之间的关系。
   
### 1.原型链
     js的继承机制不同于传统的面向对象语言，采用原型链实现继承，基本思想是利用原型让一个引用类型继承另一个引用类型的属性和方法。理解原型链必须先理解原型，以下是对于原型的一些解释：
   <!--more-->
   >无论什么时候，只要创建了一个新函数，就会根据一组特定规则为该函数创建一个prototype属性。这个属性指向函数的原型对象，所有原型对象都会自动获得一个constructor属性，这个属性是一个指向prototype属性所在函数的指针。创建自定义的构造函数之后，其原型对象只会取得constructor属性，其他方法都是从Object继承来的。当调用构造函数创建一个新实例之后，该实例的内部包含一个指针，指向构造函数的原型对象，即[[Prototype]]，在浏览器中为_proto_
   
     也就是说，构造函数和实例实际上都是存在一个指向原型的指针，构造函数指向原型的指针为其prototype属性。实例也包含一个不可访问的指针[[Prototype]]（实际在浏览器中可以用_proto_访问），而原型链的形成真正依赖的是_proto_而非Prototype。
   
   **举个例子**
   
   下边是一个最简单的继承方式的例子：用父类实例充当子类原型对象。
```javascript
function SuperType(){                        
       this.property = true;
       this.arr = [1];
   }
   SuperType.prototype.getSuperValue = function(){
       return this.property;
   };
   function SubType(){
       this.subproperty = false;
   }
   SubType.prototype = new SuperType();              
   //在此继承，SubType的prototype为SuperType的一个实例
   SubType.prototype.getSubValue = function(){
       return this.subproperty;
   };
   var instance = new SubType();
   var instance2 = new SubType();                                   
   c(instance.getSuperValue());                      //true
   c(instance.getSubValue());                        //false
   c(instance.__proto__.prototype);                  //undefined
   //SubType继承了SuperType，SuperType继承了Object。
   //instance的_proto_是SubType的原型对象，即SubType.prototype。
   //而SubType.prototype又是SuperType的一个实例。
   //则instance._proto_.prototype为undefined，
   //因为SuperType的实例对象不包含prototype属性。
   instance.arr.push(2);
   c(instance.arr);                                  //[1,2]
   c(instance2.arr);                                 //[1,2]
   //子类们共享引用属性
```
   >需要注意的一点：无论以什么方式继承，请谨慎使用将对象字面量赋值给原型的方法，这样会重写原型链。
   
   **优缺点**
   
     原型链继承方式的优点在于简单，而缺点也十分致命：
   
   1. 子类之间会共享引用类型属性
   2. 创建子类时，无法向父类构造函数传参
   
### 2.借用构造函数
     又叫经典继承，借用构造函数继承的主要思想：在子类型构造函数的内部调用超类型构造函数，即用call()或apply()方法给子类中的this执行父类的构造函数，使其拥有父类拥有的属性实现继承，这种继承方法完全没有用到原型。下边是借用构造函数的实现：
```javascript
function SuperType(){                                 
       this.colors = ["red","blue","green"];
   }
   function SubType(){
       SuperType.call(this);     //借用构造函数
   }
   var instance1 = new SubType();
   instance1.colors.push("black");
   c(instance1.colors);          //["red","blue","green","black"]
   var instance2 = new SubType();
   c(instance2.colors);          //["red","blue","green"]
```
   
   **举个例子**
   
     借用构造函数，相当于将父类拥有的属性在子类的构造函数也写了一遍，使子类拥有父类拥有的属性，这种方法在创建子类实例时，可以向父类构造函数传递参数 。
```javascript
function SuperType(name){           
       this.name = name;
   }
   function SubType(name){
       SuperType.call(this,name);          //借用构造函数模式传递参数
       this.age = 29;
   }
   var instance = new SubType("something");
   c(instance.name);                       //something
   c(instance.age);                        //29
```
   
   **优缺点**
   
     借用构造函数模式，不同于原型式继承和原型模式，它不会共享引用类型属性，而且也可以向超类型构造函数传递参数。但是相对的，由于不会共享属性，也无法实现代码复用，相同的函数在每个实例中都有一份。为了实现代码复用，提示效率，大神们又想出了下边的继承方法。
   
### 3.组合继承
   >组合继承有时也叫伪经典继承，是将原型链和借用构造函数的技术组合到一块，从而发挥二者之长的一种继承模式。
   
     即用原型链实现对原型属性和方法的继承(需要共享的)，通过借用构造函数实现对实例属性的继承(不共享的)。这样的方法实现了函数复用，而且每个实例拥有自己的属性。
   
   **举个例子**
```javascript
function SuperType(name) {                       //父类的实例属性
       this.name = name;
       this.colors = ["red", "blue", "green"];      
   }
   SuperType.prototype.sayName = function() {       //父类的原型属性
       c(this.name);
   };
   function SubType(name, age) {                    //借用构造函数继承实例属性
       SuperType.call(this, name);
       this.age = age;
   }
   SubType.prototype = new SuperType();             //原型链继承原型属性
   SubType.prototype.constructor = SubType;
   SubType.prototype.sayAge = function() {
       c(this.age);
   };
   var instance1 = new SubType("Nicholas", 29);
   instance1.colors.push("black");
   c(instance1.colors);        //"red,blue,green,black"
   delete instance1.colors;    
   //删除从实例属性继承来的colors，读取colors会成为从原型继承来的实例属性
   c(instance1.colors);        //"red,blue,green"
   instance1.sayName();        //Nicholas
   instance1.sayAge();         //29
   var instance2 = new SubType("Greg", 27);
   c(instance2.colors);        //"red,blue,green"
   instance2.sayName();        //Greg
   instance2.sayAge();         //27
```
   
   **优缺点**
   
   这是所有继承方式中最常用的，它的优点也十分明显：
   
   1. 可以在创建子类实例时向父类构造函数传参。
   2. 引用类型属性的值可以不共享。
   3. 可以实现代码复用，即可以共享相同的方法。
   
   但是这种方法依然有一点不足，调用了两次父类的构造函数，最后会讲到一种理论上接近完美的继承方式，即寄生组合式继承。
   
### 4.原型式继承
     原型式继承借助原型基于已有对象创建新对象，需要一个对象作为另一个对象的基础：
```javascript
 function object(o) {
       function F() {}
       F.prototype = o;
       return new F();
   }
```
  
     上边段代码就是原型式继承的核心代码，先创建一个临时性的构造函数，然后将传入的对象作为这个构造函数的原型，最后返回这个临时类型的一个新实例。
   
   **举个例子**
```javascript
var person = {
       name: "Nicholas",
       friends: ["Shelby", "Court", "Van"]
   };
   var anotherPerson = object(person);
   anotherPerson.name = "Greg";
   anotherPerson.friends.push("Rob");
   var yetAnotherPerson = object(person);      //在此继承
   yetAnotherPerson.name = "Linda";
   yetAnotherPerson.friends.push("Barbie");
   c(person.friends);              //["Shelby","Court","Van","Rob","Barbie"]
   c(person.name);                 //Nicholas
   c(anotherPerson.name);          //Greg
   c(yetAnotherPerson.name);       //Linda
   delete yetAnotherPerson.name;   
   //删除子类的属性，就会解除对父类属性的屏蔽，暴露出父类的name属性
   c(yetAnotherPerson.name);       //Nicholas
```
   
     从上边的代码显示，由object（注意首字母小写，不是对象的构造函数）产生的两个子类会共享父类的引用属性，其中friends数组是共享的，anotherPerson和yetAnotherPerson都是继承自person。实际上相当于创建了两个person对象的副本，但可以在产生之后拥有各自的实例属性。
   
   >ECMAScript5新增了Object.create()方法规范化了原型式继承，这个方法接受两个参数：
   
   1. 一个作为新对象原型的对象（可以是对象或者null）
   2. 另一个为新对象定义额外属性的对象（可选，这个参数的格式和Object.defineProperties()方法的第二个参数格式相同，每个属性都是通过自己的描述符定义的）
     下边是一个例子：
```javascript
var person = {                      //原型式继承规范化为create()函数
       name: "Nicholas",
       friends: ["Shelby","Court","Van"]
   };
   var anotherPerson = Object.create(person, {
       name: {
           value: "Greg"
       }
   });
   c(anotherPerson.name);             //"Greg"
```
  
   **优缺点**
   
     如果想让一个对象与另一个对象保持类似，原型式继承是很贴切的，但是与原型模式一样，包含引用类型的值得属性会共享相应的值。
   
### 5.寄生式继承
   >寄生式继承与原型式继承紧密相关的一种思路，与寄生构造函数和工厂模式类似，即创建一个仅用于封装继承过程的函数，函数内部以某种方式来增强对象，最后再像真的做了所有工作一样返回对象。
   
   **举个例子**
```javascript
 function createAnother(original) {
       var clone = object(original);          //此处用到了原型式继承
       clone.sayHi = function() {
           c("Hi");
       };
       return clone;
   }
   var person = {                             //父类实例
       name: "Nicholas",
       friends: ["Shelby","Court","Van"]
   };
   var anotherPerson = createAnother(person);
   anotherPerson.sayHi();
```
  
     上边的寄生式继承用到了原型式继承，向实现继承的函数传入一个父类对象实例，再用原型式继承得到一个父类对象实例的副本，再给这个副本添加属性，即增强这个对象，最后返回这个副本对象。由于用到了原型式继承，这个对象的原型指向传入的父类对象实例。上边例子用到的object()函数（原型式继承）并不是必须的，任何能够返回新对象的函数都适用于寄生式继承模式。
   
   **优缺点**
   
     寄生式继承在主要考虑对象而不是创建自定义类型和构造函数时，是十分有用的。但是如果考虑到用寄生式继承为对象添加函数等，由于没有用到原型，做不到函数复用，会导致效率降低。
   
### 6.寄生组合式继承
     这个名字并不是很贴切，虽然叫寄生组合式继承，但是和寄生式继承关系不是很大，主要是用原型式继承来实现原型属性的继承，用借用构造函数模式继承实例属性。寄生组合式继承和组合继承的区别在于：
   
   1. 在继承原型属性时，组合继承用原型链继承了整个父类（通过将父类实例赋值给子类构造函数的原型对象来实现），这使子类中多了一份父类的实例属性。而寄生组合式继承用原型式继承只继承了父类的原型属性（把父类构造函数的原型对象用原型式继承复制给子类的构造函数的原型对象）。
   2. 组合继承调用了两次超类型构造函数，寄生组合式继承调用了一次。
   
   **举个例子**
```javascript
 function inheritPrototype(subType, superType) {             //寄生式继承
       var prototype = Object.create(superType.prototype);     //创建对象
       prototype.constructor = subType;                        //增强对象
       subType.prototype = prototype;                          //指定对象
   }
   function SuperType(name) {
       this.name = name;
       this.colors = ["red","blue","green"];
   }
   SuperType.prototype.sayName = function(){
       c(this.name);
   };
   function SubType(name, age) {
       SuperType.call(this, name);                 //借用构造函数
       this.age = age;                             //添加子类独有的属性
   }
   inheritPrototype(SubType, SuperType);           //此处调用实现寄生组合继承的函数
   SubType.prototype.sayAge = function() {         //添加子类独有原型属性
       c(this.age);
   };
   var son = new SubType("erzi",16);
   var father = new SuperType("baba");
   c(typeof father.sayName);                       //function
   c(typeof father.sayAge);                        //SubType独有的方法，返回undefined
   SubType.prototype.sayName = function() {        
       c("This function has be changed");          
   }   
   //更改子类的方法只会影响子类，prototype是对象,添加新属性和更改属性不会影响父类的prototype
   father.sayName();                               //baba
   son.sayName();                                  //This function has be changed
   SuperType.prototype.sayName = function() {      //更改父类的原型属性
       c("This function has be changed");
   }
   father.sayName();                               //This function has be changed
   son.sayName();                                  //This function has be changed
```
  
   **优缺点**
   
     这种继承方式理论上是完美的，但是由于出现的较晚，人们大多数使用的是组合继承模式。
    
