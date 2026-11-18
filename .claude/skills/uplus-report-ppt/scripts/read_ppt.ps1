# Read a (DRM-protected) reference deck read-only via PowerPoint COM and dump
# text + layout + font/colour info to a UTF-8 text file.
# Usage:
#   powershell -NoProfile -ExecutionPolicy Bypass -File read_ppt.ps1 -Path "<deck.pptx>" -Out "<scratchpad>\dump.txt"
# The original file is never modified. Because PowerPoint COM fails on some
# file names (e.g. ones containing special symbols), the deck is copied to an
# ASCII-named temp file first; the copy is deleted afterwards.
param(
  [Parameter(Mandatory = $true)][string]$Path,
  [Parameter(Mandatory = $true)][string]$Out
)
$ErrorActionPreference = 'Continue'

function Hex($rgb) { '#{0:X2}{1:X2}{2:X2}' -f ($rgb -band 0xFF), (($rgb -shr 8) -band 0xFF), (($rgb -shr 16) -band 0xFF) }

function Dump-Shape($sh, $sb, $indent) {
  $info = "{0}[{1}] {2} pos=({3:N0},{4:N0}) size=({5:N0}x{6:N0})" -f $indent, $sh.Type, $sh.Name, $sh.Left, $sh.Top, $sh.Width, $sh.Height
  try { if ($sh.Fill.Visible -and $sh.Fill.Type -eq 1) { $info += ' fill=' + (Hex $sh.Fill.ForeColor.RGB) } } catch {}
  try { if ($sh.Type -eq 9 -or $sh.Connector) { $info += (' line={0}/{1}pt' -f (Hex $sh.Line.ForeColor.RGB), $sh.Line.Weight) } } catch {}
  if ($sh.Type -eq 6) {
    [void]$sb.AppendLine($info + ' GROUP')
    foreach ($child in $sh.GroupItems) { Dump-Shape $child $sb ($indent + '    ') }
    return
  }
  if ($sh.HasTextFrame -and $sh.TextFrame.HasText) {
    $tr = $sh.TextFrame.TextRange
    $info += (' font={0} {1}pt bold={2} color={3}' -f $tr.Font.Name, $tr.Font.Size, $tr.Font.Bold, (Hex $tr.Font.Color.RGB))
    [void]$sb.AppendLine($info)
    [void]$sb.AppendLine($indent + '    TEXT: ' + ($tr.Text -replace "`r", ' / '))
  } elseif ($sh.HasTable) {
    $t = $sh.Table
    [void]$sb.AppendLine($info + (' TABLE {0}x{1}' -f $t.Rows.Count, $t.Columns.Count))
    for ($r = 1; $r -le $t.Rows.Count; $r++) {
      $cells = @()
      for ($c = 1; $c -le $t.Columns.Count; $c++) {
        try { $cells += ($t.Cell($r, $c).Shape.TextFrame.TextRange.Text -replace "`r", ' ') } catch { $cells += '' }
      }
      [void]$sb.AppendLine($indent + '    | ' + ($cells -join ' | '))
    }
  } else {
    [void]$sb.AppendLine($info)
  }
}

$tmp = Join-Path ([System.IO.Path]::GetTempPath()) ('ref_' + [guid]::NewGuid().ToString('N') + [System.IO.Path]::GetExtension($Path))
Copy-Item -LiteralPath $Path -Destination $tmp -Force
$sb = New-Object System.Text.StringBuilder
$pp = New-Object -ComObject PowerPoint.Application
try {
  # Open(FileName, ReadOnly=-1, Untitled=0, WithWindow=0)
  $p = $pp.Presentations.Open($tmp, -1, 0, 0)
  [void]$sb.AppendLine('FILE: ' + [System.IO.Path]::GetFileName($Path))
  [void]$sb.AppendLine(('SIZE: {0} x {1} pt; slides={2}' -f $p.PageSetup.SlideWidth, $p.PageSetup.SlideHeight, $p.Slides.Count))
  try {
    $fs = $p.SlideMaster.Theme.ThemeFontScheme
    [void]$sb.AppendLine('THEME FONTS major=' + $fs.MajorFont.Item(1).Name + ' minor=' + $fs.MinorFont.Item(1).Name)
  } catch {}
  foreach ($s in $p.Slides) {
    [void]$sb.AppendLine('')
    [void]$sb.AppendLine('=== SLIDE ' + $s.SlideIndex + ' layout=' + $s.CustomLayout.Name)
    foreach ($sh in $s.Shapes) { Dump-Shape $sh $sb '' }
  }
  $p.Close()
} catch {
  [void]$sb.AppendLine('OPEN ERR: ' + $_)
} finally {
  Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
}
[System.IO.File]::WriteAllText($Out, $sb.ToString(), [System.Text.Encoding]::UTF8)
Write-Output ('written: ' + $Out)
