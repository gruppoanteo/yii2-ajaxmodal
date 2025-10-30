<?php
namespace anteo\ajaxmodal;

use yii\web\AssetBundle;

class AjaxModalAsset extends AssetBundle
{
    public $sourcePath = '@anteo/ajaxmodal/assets';
    
    public $css = [
    ];
    
    public $js = [
        'js/ajaxmodal.js',
    ];
    
    public $depends = [
        'yii\web\YiiAsset',
        'yii\bootstrap\BootstrapAsset',
    ];
}