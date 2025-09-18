<?php
$ini = 'C:/wamp64/bin/php/php8.2.26/php.ini';
$lines = "\n; Added by script: set CA bundle\ncurl.cainfo = 'C:/Users/krawc/Desktop/Kursy/2025/food_ordering_platform/food-order/certs/cacert.pem'\nopenssl.cafile = 'C:/Users/krawc/Desktop/Kursy/2025/food_ordering_platform/food-order/certs/cacert.pem'\n";
file_put_contents($ini, $lines, FILE_APPEND);
echo "appended\n";
