Add-Type -AssemblyName System.Drawing
$repo = "C:\Users\e548609\projects\workadventure"
$out  = "C:\Users\e548609\AppData\Local\Temp\claude\C--Users-e548609\3c6ea7e7-d169-4972-9e32-950aa0d424a4\scratchpad\renders"
New-Item -ItemType Directory -Force $out | Out-Null

# load tilesets once (from office.tmj)
$office = Get-Content "$repo\office.tmj" -Raw | ConvertFrom-Json
$tsets = @()
foreach($t in $office.tilesets){
  $img = [System.Drawing.Image]::FromFile("$repo\$($t.image)")
  $tsets += [pscustomobject]@{ first=$t.firstgid; cols=$t.columns; count=$t.tilecount; img=$img }
}
function Resolve-Gid($gid){
  $g = $gid -band 0x1FFFFFFF
  if($g -eq 0){ return $null }
  $best=$null
  foreach($t in $tsets){ if($g -ge $t.first -and $g -lt ($t.first+$t.count)){ $best=$t } }
  if(-not $best){ return $null }
  $loc=$g-$best.first; $col=$loc % $best.cols; $row=[math]::Floor($loc/$best.cols)
  return [pscustomobject]@{ img=$best.img; sx=$col*32; sy=$row*32 }
}

$maps = Get-ChildItem "$repo\*.tmj" | ? { $_.Name -notin @("office.tmj","conference.tmj") }
foreach($f in $maps){
  $m = Get-Content $f.FullName -Raw | ConvertFrom-Json
  $W=[int]$m.width; $H=[int]$m.height
  $bmp = New-Object System.Drawing.Bitmap ([int]($W*32)),([int]($H*32))
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::FromArgb(20,20,28))
  foreach($layer in $m.layers){
    if($layer.type -ne "tilelayer"){ continue }
    if($layer.name -eq "collisions" -or $layer.name -eq "night"){ continue }
    $data=$layer.data
    for($i=0;$i -lt $data.Count;$i++){
      $gid=$data[$i]; if($gid -eq 0){ continue }
      $r=Resolve-Gid $gid; if(-not $r){ continue }
      $x=($i % $W)*32; $y=[math]::Floor($i/$W)*32
      $g.DrawImage($r.img,(New-Object System.Drawing.Rectangle $x,$y,32,32),(New-Object System.Drawing.Rectangle $r.sx,$r.sy,32,32),[System.Drawing.GraphicsUnit]::Pixel)
    }
  }
  # collision overlay (faint red)
  $colLayer = $m.layers | ? { $_.name -eq "collisions" }
  if($colLayer){
    $rb = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(70,255,40,40))
    for($i=0;$i -lt $colLayer.data.Count;$i++){ if($colLayer.data[$i] -ne 0){ $x=($i%$W)*32;$y=[math]::Floor($i/$W)*32; $g.FillRectangle($rb,$x,$y,32,32) } }
  }
  # area overlay
  $objLayer = $m.layers | ? { $_.type -eq "objectgroup" }
  $fnt = New-Object System.Drawing.Font "Arial",9,([System.Drawing.FontStyle]::Bold)
  foreach($o in $objLayer.objects){
    $col=[System.Drawing.Color]::Yellow
    $isStart=$false;$isExit=$false
    if($o.properties){ foreach($p in $o.properties){ if($p.name -eq "start"){$isStart=$true}; if($p.name -eq "exitUrl"){$isExit=$true}; if($p.name -eq "jitsiRoom"){$col=[System.Drawing.Color]::Magenta}; if($p.name -eq "openWebsite"){$col=[System.Drawing.Color]::Cyan} } }
    if($isStart){$col=[System.Drawing.Color]::LimeGreen}; if($isExit){$col=[System.Drawing.Color]::DeepSkyBlue}
    $pen=New-Object System.Drawing.Pen $col,2
    $g.DrawRectangle($pen,[int]$o.x,[int]$o.y,[int]$o.width,[int]$o.height)
    $g.DrawString($o.name,$fnt,[System.Drawing.Brushes]::Black,([int]$o.x+2),([int]$o.y+1))
    $g.DrawString($o.name,$fnt,(New-Object System.Drawing.SolidBrush $col),([int]$o.x+1),([int]$o.y))
  }
  $name=$f.BaseName
  $bmp.Save("$out\$name.png")
  $g.Dispose();$bmp.Dispose()
  "rendered $name ($W x $H)"
}
foreach($t in $tsets){ $t.img.Dispose() }
"OUT: $out"