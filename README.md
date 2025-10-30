Yii2 ajaxmodal
======================
Allot extension

Installation
------------

The preferred way to install this extension is through [composer](http://getcomposer.org/download/).

Either run

```
php composer.phar require --prefer-dist hal/yii2-ajaxmodal "*"
```

or add

```
"hal/yii2-ajaxmodal": "*"
```

to the require section of your `composer.json` file.


Usage
-----

AjaxModal could be put in layout inside BODY tag
optionally trigger could have a data-modal-class and data-modal-size attributes to add specific class/size to modal 

```php
<?= AjaxModal::widget([
    'id' => 'ajax-modal',
//   'url' => ['controller/action'] // <-- this could be passed by trigger element using href or data-url attribute
//   'pjaxContainer' => '#pjax', // <-- this could be passed by trigger element using data-pjax-container attribute
//   'header' => Html::tag('h4', 'Title', ['class' => 'modal-title'], //  <-- this could be changed by trigger element using title or data-title attribute
//   'ajaxSubmit' => true // manages contained form submit, //  <-- this could be changed by trigger element using title or data-ajax-submit attribute
//   'autoClose' => true // automatically closes Modal after submit,
//   'loadingText' => 'loading' // loading message
//   'loadingHtml' => '' // loading html. default is animated progress bar
]) ?>
```

in controller:
```php

// If action is ajax or get/post
public function actionCreate()
{
    $model = new Company();

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
        if (Yii::$app->request->isAjax) {
            // JSON response is expected in case of successful save
            Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
            return ['success' => true];
        }
        return $this->redirect(['view', 'id' => $model->id]);             
    }

    if (Yii::$app->request->isAjax) {
        return $this->renderAjax('create', [
            'model' => $model,
        ]);
    } else {
        return $this->render('create', [
            'model' => $model,
        ]);
    }
}

// If action is ajax only
public function actionCreate()
{
    if (!Yii::$app->request->isAjax) {
        throw new BadRequestHttpException;
    }

    $model = new Post();
        
    if (Yii::$app->request->post('ajax') && $model->load(Yii::$app->request->post())) { // @see ActiveForm::ajaxParam
        Yii::$app->response->format = Response::FORMAT_JSON;
        return ActiveForm::validate($model);
        // Yii 2.0.10 // return $this->asJson(ActiveForm::validate($model));
    }

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
        Yii::$app->response->format = Response::FORMAT_JSON;
        return ['success' => true];
        // OR, If you need to redirect 
        // return $this->redirect(['view', 'id' => $model->id], 200);
        // Yii 2.0.10 // return $this->asJson(['success' => true]);
    }
    return $this->renderAjax('create', [
        'model' => $model,
    ]);
}
```

events:

AjaxModal::EVENT_BEFORE_LOAD
AjaxModal::EVENT_AFTER_LOAD
AjaxModal::EVENT_BEFORE_SUBMIT;
AjaxModal::EVENT_AFTER_SUBMIT;