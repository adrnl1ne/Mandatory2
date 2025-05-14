@echo off
echo Generating hospital database documentation...

rem Create output directory if it doesn't exist
if not exist "output" mkdir "output"

rem Clean the output directory first
echo Cleaning output directory...
del /q "output\*.*"
for /d %%x in ("output\*") do @rd /s /q "%%x"

echo Running SchemaSpy documentation generator...
java -jar "tools\schemaspy.jar" ^
  -t pgsql ^
  -dp tools/postgresql-jdbc.jar ^
  -host localhost ^
  -port 5432 ^
  -db hospitaldb ^
  -u postgres ^
  -p postgres ^
  -o output ^
  -s public ^
  -desc "Hospital Management System Database" ^
  -vizjs

if %errorlevel% neq 0 (
  echo ERROR: Documentation generation failed
  pause
  exit /b 1
)

echo Creating index file with diagram references...
(
  echo ^<!DOCTYPE html^>
  echo ^<html^>
  echo ^<head^>
  echo    ^<title^>Hospital Management System Documentation^</title^>
  echo    ^<link rel="stylesheet" href="output/css/bootstrap.min.css"^>
  echo    ^<style^>
  echo      body { margin: 20px; }
  echo      .diagram-container { margin-top: 20px; overflow-x: auto; }
  echo    ^</style^>
  echo ^</head^>
  echo ^<body^>
  echo    ^<div class="container"^>
  echo      ^<h1^>Hospital Management System Documentation^</h1^>
  echo      ^<p^>^<a href="output/index.html" class="btn btn-primary"^>View Complete Documentation^</a^>^</p^>
  echo      ^<div class="diagram-container"^>
  echo        ^<h2^>Database Schema Diagram^</h2^>
  echo        ^<img src="output/diagrams/summary/relationships.real.large.svg" alt="Database Schema" style="max-width: 100%%;"^>
  echo      ^</div^>
  echo    ^</div^>
  echo ^</body^>
  echo ^</html^>
) > hospital-docs.html

echo Opening documentation...
start hospital-docs.html

echo Documentation generation complete.
pause