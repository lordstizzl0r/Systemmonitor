$ErrorActionPreference = 'Stop'
$packageName = 'systemmonitor'
$url = 'https://github.com/lordstizzl0r/system-monitor/releases/download/v1.0.0/system-monitor-setup-1.0.0.exe'
$checksum = 'CHECKSUM_HIER_EINFÜGEN'
$checksumType = 'sha256'

Install-ChocolateyPackage $packageName 'exe' '/S' $url -checksum $checksum -checksumType $checksumType