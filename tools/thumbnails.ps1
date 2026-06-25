Add-Type -AssemblyName System.Drawing
$repo = "C:\Users\e548609\projects\workadventure"
$office = Get-Content "$repo\office.tmj" -Raw | ConvertFrom-Json
$tsets=@()
foreach($t in $office.tilesets){ $tsets+=[pscustomobject]@{first=$t.firstgid;cols=$t.columns;count=$t.tilecount;img=[System.Drawing.Image]::FromFile("$repo\$($t.image)")} }
function Resolve-Gid($gid){ $g=$gid -band 0x1FFFFFFF; if($g -eq 0){return $null}; $best=$null; foreach($t in $tsets){ if($g -ge $t.first -and $g -lt ($t.first+$t.count)){$best=$t} }; if(-not $best){return $null}; $loc=$g-$best.first; return [pscustomobject]@{img=$best.img;sx=($loc%$best.cols)*32;sy=[math]::Floor($loc/$best.cols)*32} }
$maps=Get-ChildItem "$repo\*.tmj" | ? { $_.Name -notin @("office.tmj","conference.tmj") }
foreach($f in $maps){
  $m=Get-Content $f.FullName -Raw | ConvertFrom-Json
  $W=[int]$m.width;$H=[int]$m.height
  $full=New-Object System.Drawing.Bitmap ([int]($W*32)),([int]($H*32))
  $g=[System.Drawing.Graphics]::FromImage($full); $g.Clear([System.Drawing.Color]::FromArgb(146,191,77))
  foreach($layer in $m.layers){ if($layer.type -ne "tilelayer"){continue}; if($layer.name -in @("collisions","night")){continue}
    for($i=0;$i -lt $layer.data.Count;$i++){ $gid=$layer.data[$i]; if($gid -eq 0){continue}; $r=Resolve-Gid $gid; if(-not $r){continue}
      $g.DrawImage($r.img,(New-Object System.Drawing.Rectangle (($i%$W)*32),([math]::Floor($i/$W)*32),32,32),(New-Object System.Drawing.Rectangle $r.sx,$r.sy,32,32),[System.Drawing.GraphicsUnit]::Pixel) } }
  # square 512 thumbnail (center-cropped)
  $side=[math]::Min($full.Width,$full.Height)
  $thumb=New-Object System.Drawing.Bitmap 512,512
  $tg=[System.Drawing.Graphics]::FromImage($thumb); $tg.InterpolationMode="HighQualityBicubic"
  $sx=[int](($full.Width-$side)/2);$sy=[int](($full.Height-$side)/2)
  $tg.DrawImage($full,(New-Object System.Drawing.Rectangle 0,0,512,512),(New-Object System.Drawing.Rectangle $sx,$sy,$side,$side),[System.Drawing.GraphicsUnit]::Pixel)
  $thumb.Save("$repo\$($f.BaseName).png",[System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose();$full.Dispose();$tg.Dispose();$thumb.Dispose()
  "thumb $($f.BaseName).png"
}
foreach($t in $tsets){$t.img.Dispose()}