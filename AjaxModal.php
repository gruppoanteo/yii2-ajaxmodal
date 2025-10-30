<?php 
namespace anteo\ajaxmodal;

use Yii;
use yii\bootstrap\Modal;
use yii\bootstrap\Progress;
use yii\helpers\Html;
use yii\helpers\Json;
use yii\helpers\Url;
use yii\web\JsExpression;
use yii\web\View;

/**
 * Class ModalAjax
 */
class AjaxModal extends Modal
{
    /**
     * Events
     */
    const EVENT_BEFORE_LOAD = 'ajaxmodal:beforeLoad';
    const EVENT_AFTER_LOAD = 'ajaxmodal:afterLoad';
    const EVENT_BEFORE_SUBMIT = 'ajaxmodal:beforeSubmit';
    const EVENT_AFTER_SUBMIT = 'ajaxmodal:afterSubmit';
    
    public $header = '<h4 class="modal-title">Title</h4>';
    /**
     * The url to request 
     * @var string
     */
    public $url;
    /**
     * reload pjax container after ajaxSubmit
     * @var string
     */
    public $pjaxContainer;
    /**
     * Submit the form via ajax
     * @var boolean
     */
    public $ajaxSubmit = true;
    /**
     * Submit the form via ajax
     * @var boolean
     */
    public $autoClose = true;
    /**
     * @var string text to show during loading 
     */
    public $loadingText;
    /**
     * @var string error text
     */
    public $errorText;
    /**
     * @var integer pjax reload timeout
     */
    public $pjaxTimeout = 5000;
    /**
     * @var string html in body when ajax loading
     */
    private $_loadingHtml;
    
    /**
     * @inheritdocs
     */
    public function init()
    {
        parent::init();
        $this->initTranslations();
        
        if ($this->errorText === null) {
            $this->errorText = Yii::t('ajaxmodal', 'An error occurred. Try again please.');
        }
        if ($this->loadingText === null) {
            $this->loadingText = Yii::t('ajaxmodal', 'loading') . '...';
        }
    }
    
    protected function initTranslations()
    {
        if (empty(Yii::$app->i18n->translations['ajaxmodal'])) {
            Yii::setAlias("@ajaxmodal", __DIR__);
            Yii::$app->i18n->translations['ajaxmodal*'] = [
                'class' => 'yii\i18n\PhpMessageSource',
                'basePath' => "@ajaxmodal/messages",
                'forceTranslation' => true
            ];
        }
    }
    
    public function setLoadingHtml($html)
    {
        $this->_loadingHtml = $html;
    }

    public function getLoadingHtml()
    {
        if ($this->_loadingHtml === null) {
            $this->_loadingHtml = Progress::widget([
                'barOptions' => ['class' => 'progress-bar-striped active'],
                'percent' => 100,
                'label' => $this->loadingText,
            ]);
        }
        return $this->_loadingHtml;
    }
        
    /**
     * @inheritdocs
     */
    public function run()
    {
        /** @var View */
        $view = $this->getView();
        $id = $this->options['id'];
        
        AjaxModalAsset::register($view);
        $this->registerScript($id, $view);
        if (!isset($this->clientEvents[self::EVENT_AFTER_SUBMIT])) {
            $this->defaultSubmitEvent();
        }
        parent::run();
    }
    
    protected function registerScript($id, $view)
    {
        $url = is_array($this->url) ? Url::to($this->url) : $this->url;
        $options = Json::encode([
            'ajaxSubmit' => $this->ajaxSubmit,
            'url' => $url,
            'loadingHtml' => $this->loadingHtml,
            'pjaxContainer' => $this->pjaxContainer,
            'errorText' => $this->errorText,
            'debug' => YII_DEBUG
        ]);
        $view->registerJs("
            jQuery('#{$id}').ajaxModal($options);
        ");
    }
    
    /**
     * {@inheritdoc}
     */
    protected function renderBodyBegin()
    {
        return Html::beginTag('div', ['class' => 'modal-body']) . $this->loadingHtml;
    }
    
    /**
     * register pjax event
     */
    protected function defaultSubmitEvent()
    {
        $expression = [];
        if ($this->autoClose) {
            $expression[] = "$(this).modal('toggle');";
        }
        $script = implode("\r\n", $expression);
        $this->clientEvents[self::EVENT_AFTER_SUBMIT] = new JsExpression("
            function(event, data, status, xhr, pjaxContainer) {
                if (status) {
                    if (pjaxContainer) {
                        $.pjax.reload({container: pjaxContainer, timeout: {$this->pjaxTimeout}});
                    }
                    $script
                }
            }
        ");
    }
}