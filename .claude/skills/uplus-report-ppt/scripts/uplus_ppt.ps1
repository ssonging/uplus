# Helper functions for building "style A" UPLUS launch-report decks with
# PowerPoint COM (Windows PowerShell 5.1). Dot-source this file from a
# per-deck build script:
#     . "<skill>\scripts\uplus_ppt.ps1"
#     $pres  = New-UplusDeck
#     $slide = Add-UplusSlide $pres 'Title text'
#     Add-UplusHead $slide 'Head message'
#     ...
#     Save-UplusDeck $pres '<UPLUS>\outputs\YYMMDD_name_v1.0.pptx'
#     Export-UplusPng '<saved pptx>' '<scratchpad>\png'
# The per-deck script contains Korean text, so save it as UTF-8 *with BOM*.
# This file is ASCII-only on purpose; Korean font names are built from
# Unicode escapes below. All measurements are in points (960 x 540 slide).
# See ../references/design-spec.md for the values used here.

$script:SkillDir = Split-Path -Parent $PSScriptRoot
$script:LogoPath = Join-Path $script:SkillDir 'assets\logo.png'

$script:LgSmart = 'LG' + (-join [char[]](0xC2A4, 0xB9C8, 0xD2B8, 0xCCB4))   # LG Smart font family (Korean name, built from code points)
$script:FontRegular  = $script:LgSmart + ' Regular'
$script:FontSemiBold = $script:LgSmart + ' SemiBold'
$script:FontBold     = $script:LgSmart + ' Bold'
$script:FontNarrow   = 'Arial Narrow'

$script:C = @{
  Pink      = '#FF3399'
  DeepPink  = '#FF2C97'
  Blue      = '#0000FF'
  Green     = '#1C771C'
  BoxGray   = '#F2F2F2'
  LineGray  = '#D9D9D9'
  DarkGray  = '#7F7F7F'
  Border    = '#808080'
  Black     = '#000000'
  White     = '#FFFFFF'
}

function ConvertTo-OleColor([string]$hex) {
  $h = $hex.TrimStart('#')
  $r = [Convert]::ToInt32($h.Substring(0, 2), 16)
  $g = [Convert]::ToInt32($h.Substring(2, 2), 16)
  $b = [Convert]::ToInt32($h.Substring(4, 2), 16)
  return $r + ($g * 256) + ($b * 65536)
}

function New-UplusDeck {
  $app = New-Object -ComObject PowerPoint.Application
  $pres = $app.Presentations.Add(0)          # 0 = no window
  $pres.PageSetup.SlideWidth = 960
  $pres.PageSetup.SlideHeight = 540
  return $pres
}

function Set-UplusFont($textRange, [double]$size, [string]$font = $script:FontRegular, [string]$color = '#000000', [bool]$bold = $false) {
  if ($size -lt 9) { throw "Font size $size pt is below the 9 pt minimum." }
  $textRange.Font.Name = $font
  $textRange.Font.NameFarEast = $font
  $textRange.Font.Size = $size
  $textRange.Font.Bold = [int]$bold * -1
  $textRange.Font.Color.RGB = ConvertTo-OleColor $color
}

function Add-UplusText {
  param(
    $Slide, [string]$Text,
    [double]$Left, [double]$Top, [double]$Width, [double]$Height = 20,
    [double]$Size = 12, [switch]$Bold, [string]$Color = '#000000',
    [string]$Font = $script:FontRegular, [double]$LineSpacing = 1.0,
    [ValidateSet('Left', 'Center', 'Right')][string]$Align = 'Left'
  )
  $box = $Slide.Shapes.AddTextbox(1, $Left, $Top, $Width, $Height)
  $tf = $box.TextFrame
  $tf.WordWrap = -1
  $tf.AutoSize = 1                            # shape grows to fit text
  $tf.MarginLeft = 2; $tf.MarginRight = 2; $tf.MarginTop = 2; $tf.MarginBottom = 2
  $tf.TextRange.Text = ($Text -replace "`r?`n", "`r")
  Set-UplusFont $tf.TextRange $Size $Font $Color ([bool]$Bold)
  $tf.TextRange.ParagraphFormat.SpaceWithin = $LineSpacing
  $tf.TextRange.ParagraphFormat.Alignment = @{ Left = 1; Center = 2; Right = 3 }[$Align]
  return $box
}

function Add-UplusDot($Slide, [double]$Left, [double]$Top) {
  $dot = $Slide.Shapes.AddShape(9, $Left, $Top, 8, 8)     # 9 = oval
  $dot.Fill.ForeColor.RGB = ConvertTo-OleColor $script:C.Pink
  $dot.Line.Visible = 0
  return $dot
}

# Common header: pink dot, 20 pt title, grey rule, logo (top right).
function Add-UplusSlide($Pres, [string]$Title) {
  $slide = $Pres.Slides.Add($Pres.Slides.Count + 1, 12)    # 12 = blank layout
  [void](Add-UplusDot $slide 51 40)
  $t = Add-UplusText -Slide $slide -Text $Title -Left 67 -Top 33 -Width 713 -Height 25 -Size 20
  $t.TextFrame.MarginLeft = 0; $t.TextFrame.MarginTop = 0
  $line = $slide.Shapes.AddLine(51, 59, 797, 59)
  $line.Line.ForeColor.RGB = ConvertTo-OleColor $script:C.LineGray
  $line.Line.Weight = 1.5
  if (Test-Path $script:LogoPath) {
    [void]$slide.Shapes.AddPicture($script:LogoPath, 0, -1, 804, 35, 113, 29)
  } else {
    Write-Warning "Logo not found at $script:LogoPath - logo area left empty."
  }
  return $slide
}

# Head message: pink dot + 16 pt SemiBold face, 1-2 lines. A real SemiBold face is used
# instead of synthetic bold, which PowerPoint fails to render when a line starts with digits.
function Add-UplusHead($Slide, [string]$Text, [double]$Top = 89, [double]$Width = 864) {
  [void](Add-UplusDot $Slide 51 ($Top + 5))
  $h = Add-UplusText -Slide $Slide -Text $Text -Left 67 -Top $Top -Width $Width -Height 40 -Size 16 -Font $script:FontSemiBold
  $h.TextFrame.MarginLeft = 0
  return $h
}

# Sub message / body: 14 pt with 1.3 line spacing.
function Add-UplusBody($Slide, [string]$Text, [double]$Left = 65, [double]$Top = 129, [double]$Width = 864, [double]$Size = 14) {
  return Add-UplusText -Slide $Slide -Text $Text -Left $Left -Top $Top -Width $Width -Height 24 -Size $Size -LineSpacing 1.3
}

# Footnote ("* ...") or reference (reference-mark prefix, green) in 10 pt.
function Add-UplusNote($Slide, [string]$Text, [double]$Left, [double]$Top, [double]$Width = 400, [switch]$Reference) {
  $color = if ($Reference) { $script:C.Green } else { $script:C.Black }
  return Add-UplusText -Slide $Slide -Text $Text -Left $Left -Top $Top -Width $Width -Height 14 -Size 10 -Color $color
}

# "[Table name]" label above a table, optional unit text ("VAT ...") right-aligned to the table edge.
function Add-UplusTableLabel($Slide, [string]$Label, [double]$TableLeft, [double]$TableTop, [double]$TableWidth, [string]$Unit = '') {
  [void](Add-UplusText -Slide $Slide -Text $Label -Left ($TableLeft - 8) -Top ($TableTop - 21) -Width 220 -Height 18 -Size 11 -Bold -Font $script:FontNarrow)
  if ($Unit) {
    [void](Add-UplusText -Slide $Slide -Text $Unit -Left ($TableLeft + $TableWidth - 90) -Top ($TableTop - 19) -Width 90 -Height 16 -Size 10 -Bold -Align Right)
  }
}

# Table from an array of rows (each row an array of strings).
#   -HeaderRow    : fill first row with #F2F2F2
#   -HeaderColumn : fill first column with #F2F2F2
#   -Highlight    : list of "row,col" (1-based) cells shown bold blue
function Add-UplusTable {
  param(
    $Slide, [object[]]$Rows,
    [double]$Left, [double]$Top, [double]$Width, [double]$Height,
    [double]$Size = 10, [switch]$HeaderRow, [switch]$HeaderColumn, [string[]]$Highlight = @()
  )
  $nr = $Rows.Count
  $nc = ($Rows | ForEach-Object { @($_).Count } | Measure-Object -Maximum).Maximum
  $shape = $Slide.Shapes.AddTable($nr, $nc, $Left, $Top, $Width, $Height)
  $tbl = $shape.Table
  $tbl.ApplyStyle('{2D5ABB26-0587-4C30-8999-92F81FD0307C}')   # "No Style, No Grid"
  $border = ConvertTo-OleColor $script:C.Border
  for ($r = 1; $r -le $nr; $r++) {
    $row = @($Rows[$r - 1])
    for ($c = 1; $c -le $nc; $c++) {
      $cell = $tbl.Cell($r, $c)
      $tf = $cell.Shape.TextFrame
      $tf.MarginLeft = 3; $tf.MarginRight = 3; $tf.MarginTop = 2; $tf.MarginBottom = 2
      $tf.VerticalAnchor = 3                                   # middle
      $text = if ($c -le $row.Count) { [string]$row[$c - 1] } else { '' }
      $tf.TextRange.Text = ($text -replace "`r?`n", "`r")
      $isHi = $Highlight -contains "$r,$c"
      $color = if ($isHi) { $script:C.Blue } else { $script:C.Black }
      Set-UplusFont $tf.TextRange $Size $script:FontRegular $color $isHi
      $tf.TextRange.ParagraphFormat.Alignment = 2              # center
      foreach ($b in 1, 3) {                                   # top, bottom
        $cell.Borders($b).Visible = -1
        $cell.Borders($b).ForeColor.RGB = $border
        $cell.Borders($b).Weight = 0.5
      }
      foreach ($b in 2, 4) { $cell.Borders($b).Visible = 0 }   # no vertical lines
      if (($HeaderRow -and $r -eq 1) -or ($HeaderColumn -and $c -eq 1)) {
        $cell.Shape.Fill.Visible = -1
        $cell.Shape.Fill.ForeColor.RGB = ConvertTo-OleColor $script:C.BoxGray
      }
    }
  }
  return $shape
}

# Grey rounded group box (draw first so it sits behind other shapes).
function Add-UplusBox($Slide, [double]$Left, [double]$Top, [double]$Width, [double]$Height, [string]$Fill = '#F2F2F2') {
  $box = $Slide.Shapes.AddShape(5, $Left, $Top, $Width, $Height)    # 5 = rounded rectangle
  $box.Fill.ForeColor.RGB = ConvertTo-OleColor $Fill
  $box.Line.Visible = 0
  $box.Adjustments.Item(1) = 0.08
  return $box
}

# Save as .pptx. Refuses to overwrite: bump the version (v1.1, v1.2, ...) instead.
function Save-UplusDeck($Pres, [string]$Path) {
  if (Test-Path -LiteralPath $Path) { throw "File already exists: $Path (bump the version instead of overwriting)" }
  $dir = Split-Path -Parent $Path
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  $Pres.SaveAs($Path, 24)        # 24 = ppSaveAsOpenXMLPresentation (.pptx)
  $Pres.Close()
  Write-Output "saved: $Path"
}

# Render every slide to PNG (for visual review). Output goes to a scratch folder, not outputs/.
function Export-UplusPng([string]$PptxPath, [string]$OutDir, [int]$Width = 1920, [int]$Height = 1080) {
  if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }
  $app = New-Object -ComObject PowerPoint.Application
  $p = $app.Presentations.Open($PptxPath, -1, 0, 0)
  foreach ($s in $p.Slides) {
    $file = Join-Path $OutDir ('slide{0:D2}.png' -f $s.SlideIndex)
    $s.Export($file, 'PNG', $Width, $Height)
    Write-Output $file
  }
  $p.Close()
}

# First run only: extract the top-right logo (about 113x29 pt at x>=800, y~35)
# from a reference deck into assets\logo.png. Opens a temp ASCII-named copy read-only.
function Export-UplusLogo([string]$ReferencePptx, [string]$OutPng = $script:LogoPath) {
  $dir = Split-Path -Parent $OutPng
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  $tmp = Join-Path ([System.IO.Path]::GetTempPath()) ('ref_' + [guid]::NewGuid().ToString('N') + '.pptx')
  Copy-Item -LiteralPath $ReferencePptx -Destination $tmp -Force
  $app = New-Object -ComObject PowerPoint.Application
  try {
    $p = $app.Presentations.Open($tmp, -1, 0, 0)
    $logo = $null
    foreach ($sh in $p.Slides(1).Shapes) {
      if ($sh.Type -eq 13 -and $sh.Left -ge 790 -and $sh.Top -lt 60 -and $sh.Width -lt 160) { $logo = $sh; break }
    }
    if (-not $logo) { throw 'Logo picture not found on slide 1.' }
    Add-Type -AssemblyName System.Drawing
    $ok = $false
    try {
      $logo.Export($OutPng, 2, [int]($logo.Width * 4), [int]($logo.Height * 4))   # 2 = PNG
      if (Test-Path $OutPng) {
        $chk = [System.Drawing.Image]::FromFile($OutPng)
        $ok = $chk.Width -ge ($logo.Width * 3)     # Shape.Export may ignore the scale and save a blurry small image
        $chk.Dispose()
        if (-not $ok) { Remove-Item $OutPng -Force }
      }
    } catch {}
    if (-not $ok) {
      # Fallback: render slide 1 at 4x and crop the logo rectangle.
      $full = $OutPng + '.slide.png'
      $p.Slides(1).Export($full, 'PNG', 3840, 2160)
      $img = [System.Drawing.Image]::FromFile($full)
      $rect = New-Object System.Drawing.Rectangle ([int]($logo.Left * 4)), ([int]($logo.Top * 4)), ([int]($logo.Width * 4)), ([int]($logo.Height * 4))
      $bmp = (New-Object System.Drawing.Bitmap $img).Clone($rect, $img.PixelFormat)
      $bmp.Save($OutPng, [System.Drawing.Imaging.ImageFormat]::Png)
      $bmp.Dispose(); $img.Dispose(); Remove-Item $full -Force
    }
    $p.Close()
    Write-Output "logo: $OutPng"
  } finally {
    Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
  }
}
