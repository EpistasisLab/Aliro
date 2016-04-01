<!DOCTYPE html>
<html lang="en">
<head>
    <title>Frac Map</title>
    <meta charset="utf-8">
    <meta name="description" content="">
    <link href="/bobber/css/frac_map.css" rel="stylesheet" type="text/css">
    <link href="/bobber/css/jquery.dataTables.min.css" rel="stylesheet" type="text/css">
    <link href="/bobber/css/bootstrap.css" rel="stylesheet" type="text/css">
</head>
<body ng-app="myApp">
<a href='#/gene'>gene</a>
<div class="container">
    <div id="tooltip" class="hidden">
         <p><span id="value"></p>
    </div>
    <div id='angularstuff'  ng-app="myApp" class="no-js">
        <div ng-view></div>
        <div>AngularJS + RequireJS seed app: v<span app-version></span></div>
    </div>
<div id="chart" style='overflow:auto; width:960px; height: 960px;'></div>
    <div class="mini-layout fluid">
        <div class="mini-layout-sidebar lcolumn">
            <div class="lbuttons">
            </div>
        </div>
    <div class="container pull-left">
        <div id="taskcontainer">
        </div>
    </div>
</div>
    <script data-main="/bobber/js/main.js?foo=bar"  src="/bobber/js/libs/require/require.js" type="text/javascript"></script>
</body>
</html>
