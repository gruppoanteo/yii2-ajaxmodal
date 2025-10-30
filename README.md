# Yii2 Ajax Modal

Ajax-powered Bootstrap Modal widget for Yii 2. It loads modal content via AJAX when the modal opens and can submit forms inside the modal with AJAX, optionally reloading a PJAX container and auto-closing the modal on success. Provided by Marco Curatitoli at HalService. Mantained by Pietro Bardone at Anteo Impresa Sociale.

This extension provides:
- A PHP widget (`anteo\ajaxmodal\AjaxModal`) extending `yii\bootstrap\Modal`
- A JavaScript plugin (`$.fn.ajaxModal`) registered via `AjaxModalAsset`
- Built-in events/hooks for loading and submitting content
- Basic i18n support (messages in `messages/en` and `messages/it`)

## Installation

Install via Composer:

```bash
composer require anteo/yii2-ajaxmodal
```

## Quick Start

1) Add the modal widget in your view and point it to a URL that returns the modal body (e.g., a form or any HTML):

```php
use anteo\ajaxmodal\AjaxModal;

AjaxModal::begin([
    'id' => 'my-ajax-modal',
    'url' => ['item/create'], // or a full URL string
    'pjaxContainer' => '#items-pjax', // optional: PJAX container to reload after successful submit
    'ajaxSubmit' => true,             // submit forms in the modal via AJAX
    'autoClose' => true,              // close modal automatically on successful submit
    'loadingText' => Yii::t('ajaxmodal', 'loading') . '...',
    'errorText' => Yii::t('ajaxmodal', 'An error occurred. Try again please.'),
]);
AjaxModal::end();
```

2) Create a trigger element that opens the modal and defines how it behaves:

```php
echo \yii\helpers\Html::a('Create item', ['item/create'], [
    'class' => 'btn btn-primary',
    'data-toggle' => 'modal',
    'data-target' => '#my-ajax-modal',
    // Optional data attributes to override defaults per-trigger:
    'data-title' => 'Create item',      // updates modal title
    'data-url' => \yii\helpers\Url::to(['item/create']),
    'data-pjax-container' => '#items-pjax',
    'data-modal-size' => 'modal-lg',    // Bootstrap size class (e.g., modal-lg, modal-sm)
    'data-modal-class' => 'my-modal',
    'data-ajax-submit' => true,
]);
```

When the modal is shown, the plugin automatically fetches the content from the URL and injects it into `.modal-body`. If a `<form>` is present and `ajaxSubmit` is enabled, submissions are handled via AJAX. On success, it can reload a PJAX container and close the modal.

## Server-side Controller Example

Return a partial with either the initial form, or the same form with validation errors. On successful POST, return JSON or an empty response (non-HTML content-type) to signal success.

```php
public function actionCreate()
{
    $model = new Item();
    if ($model->load(Yii::$app->request->post()) && $model->save()) {
        // Return non-HTML to indicate success (the JS treats non-HTML as success)
        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return ['success' => true];
    }
    return $this->renderPartial('_form', [
        'model' => $model,
    ]);
}
```

## Options (PHP Widget)

- `url` (string|array): The URL used to load modal content on show. Arrays are processed by `Url::to()`.
- `pjaxContainer` (string|null): PJAX container selector to reload after successful submit.
- `ajaxSubmit` (bool): Submit forms inside the modal via AJAX. Default: `true`.
- `autoClose` (bool): Close the modal automatically after a successful submit. Default: `true`.
- `loadingText` (string): Text shown in the loading progress bar.
- `errorText` (string): Text shown on AJAX error when not in debug mode.
- `pjaxTimeout` (int): Timeout passed to `$.pjax.reload`. Default: `5000`.

## Data Attributes (per-trigger overrides)

On the element that opens the modal (e.g., link/button):
- `data-title`: Sets the modal title (applies to `.modal-title`).
- `data-url`: Overrides the widget `url` for this trigger.
- `data-pjax-container`: Overrides `pjaxContainer`.
- `data-modal-size`: Adds a class to `.modal-dialog` (e.g., `modal-lg`, `modal-sm`).
- `data-modal-class`: Adds a custom class to the modal root.
- `data-ajax-submit`: Enables/disables AJAX submit for this trigger.

## JavaScript Events

You can hook into the lifecycle using jQuery events triggered on the modal element:

- `ajaxmodal:beforeLoad` — before content is requested
- `ajaxmodal:afterLoad` — after content is injected
- `ajaxmodal:beforeSubmit` — before AJAX form submit
- `ajaxmodal:afterSubmit` — after AJAX form submit

Example:

```js
$('#my-ajax-modal')
  .on('ajaxmodal:beforeLoad', function (e, xhr, settings) {
    // custom logic
  })
  .on('ajaxmodal:afterSubmit', function (e, data, status, xhr, pjaxContainer) {
    // status === true means success (non-HTML response)
  });
```

## How It Works

- The PHP widget registers `AjaxModalAsset`, which includes `assets/js/ajaxmodal.js`.
- On `show.bs.modal`, the plugin reads trigger data attributes and updates the modal (title, size, classes).
- On `shown.bs.modal`, the plugin fetches `url` via AJAX and injects the response into `.modal-body`.
- If `ajaxSubmit` is enabled and a `<form>` is present, submit is intercepted and sent via AJAX.
- If the server responds with HTML, it is assumed the form has errors and the HTML replaces the body (no success).
- If the server responds with non-HTML (e.g., JSON), it is treated as success. The plugin emits `afterSubmit`, optional PJAX reload occurs, and the modal can auto-close.

## Internationalization (i18n)

Translations are auto-registered under the category `ajaxmodal*`. Default messages are available for English and Italian. You can override `loadingText` and `errorText` as needed.

## Requirements

- PHP compatible with Yii 2
- `yiisoft/yii2` ~2.0.9
- `yiisoft/yii2-bootstrap` ~2.0.0
- jQuery and Bootstrap (provided via Yii asset dependencies)

## License

Creative Commons. See `composer.json` for details.


